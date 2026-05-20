const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 60,
    },
    type: {
      type: String,
      enum: ['Phone', 'Video', 'In-Person', 'Technical'],
      required: true,
    },
    meetingLink: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Cancelled', 'No-Show'],
      default: 'Scheduled',
    },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      strengths: String,
      improvements: String,
      recommendation: {
        type: String,
        enum: ['Strong Yes', 'Yes', 'Maybe', 'No'],
      },
      submittedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Interview', interviewSchema);
