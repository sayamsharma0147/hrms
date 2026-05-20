const Application = require('../models/Application');
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');
const { parsePDF, extractFields } = require('../utils/resumeParser');
const { uploadBufferToCloudinary } = require('../utils/cloudinaryUpload');

const processResumeFile = async (file) => {
  if (!file) {
    return {
      resumeUrl: null,
      parsedFields: {},
      parsedFromResume: false,
    };
  }

  let text = '';
  if (file.mimetype === 'application/pdf' && file.buffer) {
    text = await parsePDF(file.buffer);
  }

  const parsedFields = extractFields(text);
  const parsedFromResume = Boolean(text.trim());

  const uploadResult = await uploadBufferToCloudinary(
    file.buffer,
    file.originalname
  );

  return {
    resumeUrl: uploadResult.secure_url,
    parsedFields,
    parsedFromResume,
  };
};

const submitApplication = async (req, res, next) => {
  try {
    const body = req.body;
    const {
      jobId,
      name,
      currentTitle,
      coverNote,
      source,
    } = body;

    const { resumeUrl, parsedFields, parsedFromResume } =
      await processResumeFile(req.file);

    const email = (body.email || parsedFields.email || '').toLowerCase().trim();
    const phone = body.phone?.trim() || parsedFields.phone || '';
    const linkedIn = body.linkedIn?.trim() || parsedFields.linkedIn || '';

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!email) {
      return res.status(400).json({
        message: 'Email is required (provide in form or upload a parseable PDF resume)',
      });
    }

    const job = await Job.findById(jobId);
    if (!job || job.status !== 'Open') {
      return res.status(400).json({
        message: 'This job is not open for applications',
      });
    }

    let candidate = await Candidate.findOne({ email });

    if (!candidate) {
      candidate = await Candidate.create({
        name: name.trim(),
        email,
        phone,
        currentTitle: currentTitle?.trim(),
        linkedIn,
        skills: parsedFields.skills || [],
        resumeUrl: resumeUrl || undefined,
        parsedFromResume: parsedFromResume && Boolean(resumeUrl),
      });
    } else {
      candidate.name = name.trim();
      if (body.phone?.trim()) {
        candidate.phone = body.phone.trim();
      } else if (!body.phone && parsedFields.phone && !candidate.phone) {
        candidate.phone = parsedFields.phone;
      }
      if (currentTitle) candidate.currentTitle = currentTitle.trim();
      if (body.linkedIn?.trim()) {
        candidate.linkedIn = body.linkedIn.trim();
      } else if (!body.linkedIn && parsedFields.linkedIn && !candidate.linkedIn) {
        candidate.linkedIn = parsedFields.linkedIn;
      }
      if (parsedFields.skills?.length) {
        candidate.skills = [
          ...new Set([...(candidate.skills || []), ...parsedFields.skills]),
        ];
      }
      if (resumeUrl) {
        candidate.resumeUrl = resumeUrl;
        if (parsedFromResume) candidate.parsedFromResume = true;
      }
      await candidate.save();
    }

    const existing = await Application.findOne({
      job: jobId,
      candidate: candidate._id,
    });

    if (existing) {
      return res.status(400).json({
        message: 'You have already applied for this position',
      });
    }

    const application = await Application.create({
      job: jobId,
      candidate: candidate._id,
      stage: 'Applied',
      source: source || 'Website',
      coverNote,
      stageHistory: [
        {
          stage: 'Applied',
          note: 'Application submitted',
        },
      ],
    });

    const populated = await Application.findById(application._id)
      .populate(
        'candidate',
        'name email phone currentTitle linkedIn skills resumeUrl parsedFromResume'
      )
      .populate('job', 'title department');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

const getApplicationsByJob = async (req, res, next) => {
  try {
    const { jobId, stage } = req.query;

    if (!jobId) {
      return res.status(400).json({ message: 'jobId query parameter is required' });
    }

    const filter = { job: jobId };
    if (stage) {
      filter.stage = stage;
    }

    const applications = await Application.find(filter)
      .populate('candidate', 'name email phone currentTitle skills')
      .populate('job', 'title department')
      .sort({ updatedAt: -1 });

    const result = applications.map((app) => {
      const latestEntry =
        app.stageHistory.length > 0
          ? app.stageHistory[app.stageHistory.length - 1]
          : null;

      return {
        ...app.toObject(),
        stageHistoryLength: app.stageHistory.length,
        latestStage: latestEntry,
      };
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

const getApplicationById = async (req, res, next) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'candidate',
        populate: { path: 'notes.addedBy', select: 'name' },
      })
      .populate('job', 'title department')
      .populate({
        path: 'stageHistory.changedBy',
        select: 'name',
      });

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
};

const updateStage = async (req, res, next) => {
  try {
    const { stage, note } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    application.stage = stage;
    application.stageHistory.push({
      stage,
      changedBy: req.user.id,
      note,
    });

    await application.save();

    const populated = await Application.findById(application._id)
      .populate('candidate', 'name email phone currentTitle skills')
      .populate('job', 'title department')
      .populate({
        path: 'stageHistory.changedBy',
        select: 'name',
      });

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

const addNote = async (req, res, next) => {
  try {
    const { text } = req.body;

    const application = await Application.findById(req.params.id).populate(
      'candidate'
    );

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    application.candidate.notes.push({
      text,
      addedBy: req.user.id,
    });

    await application.candidate.save();

    const candidate = await Candidate.findById(application.candidate._id)
      .populate('notes.addedBy', 'name');

    res.json(candidate.notes);
  } catch (error) {
    next(error);
  }
};

const deleteApplication = async (req, res, next) => {
  try {
    const application = await Application.findByIdAndDelete(req.params.id);

    if (!application) {
      res.status(404);
      throw new Error('Application not found');
    }

    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitApplication,
  getApplicationsByJob,
  getApplicationById,
  updateStage,
  addNote,
  deleteApplication,
};
