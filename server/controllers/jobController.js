const Job = require('../models/Job');

const createJob = async (req, res, next) => {
  try {
    const job = await Job.create({
      ...req.body,
      createdBy: req.user.id,
    });

    const populated = await Job.findById(job._id).populate(
      'createdBy',
      'name email'
    );

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

const getAllJobs = async (req, res, next) => {
  try {
    const { status, department, search, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (department) {
      filter.department = department;
    }

    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Job.countDocuments(filter),
    ]);

    res.json({
      jobs,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('createdBy', 'name email');

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    res.json(job);
  } catch (error) {
    next(error);
  }
};

const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const ALLOWED_TRANSITIONS = {
  Draft: ['Open'],
  Open: ['Closed'],
  Closed: [],
};

const changeJobStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      res.status(404);
      throw new Error('Job not found');
    }

    const allowed = ALLOWED_TRANSITIONS[job.status] || [];

    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${job.status} to ${status}`,
      });
    }

    job.status = status;
    await job.save();

    const populated = await Job.findById(job._id).populate(
      'createdBy',
      'name email'
    );

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  changeJobStatus,
};
