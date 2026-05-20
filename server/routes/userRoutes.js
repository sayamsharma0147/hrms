const express = require('express');
const { getUsers } = require('../controllers/userController');
const protect = require('../middleware/protect');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/', protect, authorize('Admin', 'HR Manager'), getUsers);

module.exports = router;
