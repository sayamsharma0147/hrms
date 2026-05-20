const express = require('express');
const {
  submitApplication,
  getApplicationsByJob,
  getApplicationById,
  updateStage,
  addNote,
  deleteApplication,
} = require('../controllers/applicationController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');
const upload = require('../middleware/upload');

const router = express.Router();

const handleUpload = (req, res, next) => {
  upload.memoryUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.post('/', handleUpload, submitApplication);

router.get(
  '/',
  protect,
  authorize('Admin', 'HR Manager'),
  getApplicationsByJob
);

router.get('/:id', protect, getApplicationById);

router.patch(
  '/:id/stage',
  protect,
  authorize('Admin', 'HR Manager'),
  updateStage
);

router.post('/:id/notes', protect, addNote);

router.delete('/:id', protect, authorize('Admin'), deleteApplication);

module.exports = router;
