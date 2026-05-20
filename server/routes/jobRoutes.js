const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  changeJobStatus,
} = require('../controllers/jobController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');

const router = express.Router();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }
  next();
};

const jobBodyRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('type')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship'])
    .withMessage('Invalid job type'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('requirements').optional().isArray(),
  body('status')
    .optional()
    .isIn(['Draft', 'Open', 'Closed'])
    .withMessage('Invalid status'),
];

router.get('/', getAllJobs);

router.post(
  '/',
  protect,
  authorize('Admin', 'HR Manager'),
  jobBodyRules,
  validate,
  createJob
);

router.put(
  '/:id',
  protect,
  authorize('Admin', 'HR Manager'),
  jobBodyRules,
  validate,
  updateJob
);

router.delete('/:id', protect, authorize('Admin'), deleteJob);

router.patch(
  '/:id/status',
  protect,
  authorize('Admin', 'HR Manager'),
  param('id').isMongoId().withMessage('Invalid job id'),
  body('status')
    .isIn(['Draft', 'Open', 'Closed'])
    .withMessage('Invalid status'),
  validate,
  changeJobStatus
);

router.get('/:id', getJobById);

module.exports = router;
