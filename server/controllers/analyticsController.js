const { Parser } = require('json2csv');
const Job = require('../models/Job');
const Application = require('../models/Application');

const PIPELINE_STAGES = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
];

const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const [
      totalJobs,
      openJobs,
      totalApplications,
      newThisWeek,
      hiredThisMonth,
      stageAgg,
      topJobsAgg,
      recentApplications,
    ] = await Promise.all([
      Job.countDocuments(),
      Job.countDocuments({ status: 'Open' }),
      Application.countDocuments(),
      Application.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Application.countDocuments({
        stage: 'Hired',
        updatedAt: { $gte: startOfMonth, $lte: endOfMonth },
      }),
      Application.aggregate([
        { $group: { _id: '$stage', count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $group: { _id: '$job', applicationCount: { $sum: 1 } } },
        { $sort: { applicationCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'jobs',
            localField: '_id',
            foreignField: '_id',
            as: 'job',
          },
        },
        { $unwind: '$job' },
        {
          $project: {
            jobTitle: '$job.title',
            department: '$job.department',
            applicationCount: 1,
          },
        },
      ]),
      Application.find()
        .populate('candidate', 'name')
        .populate('job', 'title')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const stageMap = Object.fromEntries(
      stageAgg.map((s) => [s._id, s.count])
    );

    const applicationsByStage = PIPELINE_STAGES.map((stage) => ({
      stage,
      count: stageMap[stage] || 0,
    }));

    res.json({
      totalJobs,
      openJobs,
      totalApplications,
      newThisWeek,
      hiredThisMonth,
      applicationsByStage,
      topJobs: topJobsAgg,
      recentApplications: recentApplications.map((app) => ({
        _id: app._id,
        candidateName: app.candidate?.name || 'Unknown',
        jobTitle: app.job?.title || 'Unknown',
        stage: app.stage,
        createdAt: app.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

const getPipelineFunnel = async (req, res, next) => {
  try {
    const { jobId } = req.query;
    const match = jobId ? { job: jobId } : {};

    const stageAgg = await Application.aggregate([
      { $match: match },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]);

    const stageMap = Object.fromEntries(
      stageAgg.map((s) => [s._id, s.count])
    );

    const funnel = PIPELINE_STAGES.map((stage) => ({
      stage,
      count: stageMap[stage] || 0,
    }));

    res.json(funnel);
  } catch (error) {
    next(error);
  }
};

const daysBetween = (start, end) => {
  const ms = new Date(end) - new Date(start);
  return ms / (1000 * 60 * 60 * 24);
};

const getTimeToHire = async (req, res, next) => {
  try {
    const hiredApplications = await Application.find({ stage: 'Hired' })
      .populate('job', 'title')
      .lean();

    const records = [];

    for (const app of hiredApplications) {
      const hiredEntry = (app.stageHistory || []).find(
        (entry) => entry.stage === 'Hired'
      );
      const hiredAt = hiredEntry?.changedAt || app.updatedAt;
      const days = daysBetween(app.createdAt, hiredAt);
      records.push({
        jobTitle: app.job?.title || 'Unknown',
        days,
      });
    }

    const totalHired = records.length;

    if (totalHired === 0) {
      return res.json({
        averageDays: 0,
        byJob: [],
        totalHired: 0,
      });
    }

    const averageDays =
      Math.round(
        (records.reduce((sum, r) => sum + r.days, 0) / totalHired) * 10
      ) / 10;

    const jobMap = {};
    for (const { jobTitle, days } of records) {
      if (!jobMap[jobTitle]) {
        jobMap[jobTitle] = { totalDays: 0, hiredCount: 0 };
      }
      jobMap[jobTitle].totalDays += days;
      jobMap[jobTitle].hiredCount += 1;
    }

    const byJob = Object.entries(jobMap)
      .map(([jobTitle, { totalDays, hiredCount }]) => ({
        jobTitle,
        averageDays: Math.round((totalDays / hiredCount) * 10) / 10,
        hiredCount,
      }))
      .sort((a, b) => b.hiredCount - a.hiredCount);

    res.json({ averageDays, byJob, totalHired });
  } catch (error) {
    next(error);
  }
};

const getSourceBreakdown = async (req, res, next) => {
  try {
    const sourceAgg = await Application.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const total = sourceAgg.reduce((sum, s) => sum + s.count, 0);

    const breakdown = sourceAgg.map((s) => ({
      source: s._id || 'Other',
      count: s.count,
      percentage:
        total > 0 ? Math.round((s.count / total) * 1000) / 10 : 0,
    }));

    res.json(breakdown);
  } catch (error) {
    next(error);
  }
};

const exportApplicationsCSV = async (req, res, next) => {
  try {
    const applications = await Application.find()
      .populate('candidate', 'name email phone skills')
      .populate('job', 'title department')
      .sort({ createdAt: -1 })
      .lean();

    const rows = applications.map((app) => ({
      'Application ID': app._id.toString(),
      'Candidate Name': app.candidate?.name || '',
      Email: app.candidate?.email || '',
      Phone: app.candidate?.phone || '',
      'Job Title': app.job?.title || '',
      Department: app.job?.department || '',
      Stage: app.stage,
      Source: app.source || '',
      'Applied Date': app.createdAt
        ? new Date(app.createdAt).toISOString().split('T')[0]
        : '',
      'Last Updated': app.updatedAt
        ? new Date(app.updatedAt).toISOString().split('T')[0]
        : '',
    }));

    const parser = new Parser();
    const csv = parser.parse(rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="applications_export.csv"'
    );
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getPipelineFunnel,
  getTimeToHire,
  getSourceBreakdown,
  exportApplicationsCSV,
};
