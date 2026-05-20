const Interview = require('../models/Interview');
const Application = require('../models/Application');
const { sendInterviewInvite } = require('../utils/emailService');

const populateInterview = (query) =>
  query
    .populate('interviewer', 'name email')
    .populate({
      path: 'application',
      populate: [
        { path: 'candidate', select: 'name email' },
        { path: 'job', select: 'title department' },
      ],
    });

const scheduleInterview = async (req, res, next) => {
  try {
    const {
      applicationId,
      interviewerId,
      scheduledAt,
      duration,
      type,
      meetingLink,
    } = req.body;

    if (!applicationId || !interviewerId || !scheduledAt || !type) {
      return res.status(400).json({
        message:
          'applicationId, interviewerId, scheduledAt, and type are required',
      });
    }

    const application = await Application.findById(applicationId)
      .populate('candidate')
      .populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const interview = await Interview.create({
      application: applicationId,
      interviewer: interviewerId,
      scheduledAt,
      duration: duration || 60,
      type,
      meetingLink: meetingLink?.trim() || undefined,
    });

    application.stage = 'Interview';
    application.stageHistory.push({
      stage: 'Interview',
      changedBy: req.user.id,
      note: 'Interview scheduled',
    });
    await application.save();

    sendInterviewInvite(
      application.candidate,
      interview,
      application.job
    ).catch((err) =>
      console.error('Interview invite email error:', err.message)
    );

    const populated = await populateInterview(
      Interview.findById(interview._id)
    );

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

const getInterviewsByApplication = async (req, res, next) => {
  try {
    const { applicationId, scheduledFrom, scheduledTo } = req.query;

    if (applicationId) {
      const interviews = await populateInterview(
        Interview.find({ application: applicationId }).sort({
          scheduledAt: -1,
        })
      );

      return res.json(interviews);
    }

    if (scheduledFrom && scheduledTo) {
      if (!['Admin', 'HR Manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const from = new Date(scheduledFrom);
      const to = new Date(scheduledTo);

      const interviews = await Interview.find({
        scheduledAt: { $gte: from, $lte: to },
        status: 'Scheduled',
      }).sort({ scheduledAt: 1 });

      return res.json(interviews);
    }

    return res
      .status(400)
      .json({ message: 'applicationId query parameter is required' });
  } catch (error) {
    next(error);
  }
};

const getMyInterviews = async (req, res, next) => {
  try {
    const includeCompleted = req.query.includeCompleted === 'true';
    const now = new Date();

    const filter = { interviewer: req.user.id };

    if (!includeCompleted) {
      filter.status = 'Scheduled';
      filter.scheduledAt = { $gte: now };
    }

    const interviews = await Interview.find(filter)
      .populate({
        path: 'application',
        populate: [
          { path: 'candidate', select: 'name email' },
          { path: 'job', select: 'title department' },
        ],
      })
      .sort({ scheduledAt: 1 });

    res.json(interviews);
  } catch (error) {
    next(error);
  }
};

const updateInterview = async (req, res, next) => {
  try {
    const { scheduledAt, duration, type, meetingLink, status } = req.body;

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    const previousScheduledAt = interview.scheduledAt?.getTime();

    if (scheduledAt !== undefined) interview.scheduledAt = scheduledAt;
    if (duration !== undefined) interview.duration = duration;
    if (type !== undefined) interview.type = type;
    if (meetingLink !== undefined) {
      interview.meetingLink = meetingLink?.trim() || undefined;
    }
    if (status !== undefined) interview.status = status;

    await interview.save();

    const rescheduled =
      scheduledAt !== undefined &&
      new Date(scheduledAt).getTime() !== previousScheduledAt;

    if (rescheduled) {
      const application = await Application.findById(interview.application)
        .populate('candidate')
        .populate('job');

      if (application) {
        sendInterviewInvite(
          application.candidate,
          interview,
          application.job
        ).catch((err) =>
          console.error('Reschedule invite email error:', err.message)
        );
      }
    }

    const populated = await populateInterview(
      Interview.findById(interview._id)
    );

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

const submitFeedback = async (req, res, next) => {
  try {
    const { rating, strengths, improvements, recommendation } = req.body;

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.interviewer.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Not your interview' });
    }

    if (interview.feedback?.submittedAt) {
      return res.status(400).json({ message: 'Feedback already submitted' });
    }

    interview.feedback = {
      rating,
      strengths,
      improvements,
      recommendation,
      submittedAt: new Date(),
    };
    interview.status = 'Completed';

    await interview.save();

    const populated = await populateInterview(
      Interview.findById(interview._id)
    );

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  scheduleInterview,
  getInterviewsByApplication,
  getMyInterviews,
  updateInterview,
  submitFeedback,
};
