const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateToken } = require("../middleware/auth");

// College status routes (requires authentication)
router.get("/status", authenticateToken, adminController.getCollegeStatus);
router.put("/status", authenticateToken, adminController.updateCollegeStatus);

// Student management routes (requires authentication)
router.get("/students", authenticateToken,adminController.getAllStudents);
router.get("/students/:student_id", authenticateToken, adminController.getStudentById);
router.put("/students/:student_id", authenticateToken, adminController.updateStudent);
router.delete("/students/:student_id", authenticateToken, adminController.deleteStudent);
router.get("/absentees",authenticateToken,adminController.seeAbsentees);


module.exports = router;
