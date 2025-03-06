const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");
const attendanceController = require('../controllers/attendanceController'); // Correct import

router.post('/mark', attendanceController.markAttendance);

// Register student route
router.post("/register", studentController.registerStudent);


module.exports = router;
