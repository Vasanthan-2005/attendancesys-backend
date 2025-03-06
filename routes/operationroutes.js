const express = require("express");
const router = express.Router();
const operationsController = require("../controllers/operations");
const reportController = require("../controllers/attendanceReport");

// Use correct function references
router.get("/total", operationsController.getTotalStudents);
router.get("/workingdays", operationsController.getTotalWorkingDays);
router.get("/present", operationsController.getPresentStudents);
router.get("/absent", operationsController.getAbsentStudents);

// Fix report route to accept student ID as a param
router.get("/reports/:student_id", reportController.getAttendanceReport);

module.exports = router;
