const express = require('express');
const {
  scheduleInterview,
  getInterviewsByApplication,
  getMyInterviews,
  updateInterview,
  submitFeedback,
} = require('../controllers/interviewController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('Admin', 'HR Manager'),
  scheduleInterview
);

router.get('/mine', protect, authorize('Interviewer'), getMyInterviews);

router.get('/', protect, getInterviewsByApplication);

router.put(
  '/:id',
  protect,
  authorize('Admin', 'HR Manager'),
  updateInterview
);

router.post(
  '/:id/feedback',
  protect,
  authorize('Interviewer'),
  submitFeedback
);

module.exports = router;
