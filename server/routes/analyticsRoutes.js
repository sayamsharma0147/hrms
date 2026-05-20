const express = require('express');
const {
  getDashboardStats,
  getPipelineFunnel,
  getTimeToHire,
  getSourceBreakdown,
  exportApplicationsCSV,
} = require('../controllers/analyticsController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');

const router = express.Router();

const hrOnly = [protect, authorize('Admin', 'HR Manager')];

router.get('/dashboard', ...hrOnly, getDashboardStats);
router.get('/funnel', ...hrOnly, getPipelineFunnel);
router.get('/time-to-hire', ...hrOnly, getTimeToHire);
router.get('/sources', ...hrOnly, getSourceBreakdown);
router.get('/export', ...hrOnly, exportApplicationsCSV);

module.exports = router;
