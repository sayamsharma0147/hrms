const mongoose = require('mongoose');

const stageHistorySchema = new mongoose.Schema({
  stage: {
    type: String,
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
  },
});

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    stage: {
      type: String,
      enum: [
        'Applied',
        'Screening',
        'Interview',
        'Offer',
        'Hired',
        'Rejected',
      ],
      default: 'Applied',
    },
    stageHistory: [stageHistorySchema],
    tags: {
      type: [String],
      default: [],
    },
    source: {
      type: String,
      enum: ['LinkedIn', 'Referral', 'Website', 'Job Board', 'Other'],
      default: 'Website',
    },
    coverNote: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
