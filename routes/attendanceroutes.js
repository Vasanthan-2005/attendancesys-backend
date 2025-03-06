const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController'); // Correct import

// Use correct function references
router.post('/mark', attendanceController.markAttendance);
router.get('/status', attendanceController.getCollegeStatus);

module.exports = router;
