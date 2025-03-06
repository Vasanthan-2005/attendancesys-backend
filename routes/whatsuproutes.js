const express = require("express");
const router = express.Router();
const {
    getWhatsAppQR,
    sendAttendanceReportsToAllStudents,
    sendAbsenteeMessages,
    getWhatsAppStatus,sendStudentReport
} = require("../controllers/whatsupController");

// Route to get WhatsApp Web QR Code
router.get("/get-qr", getWhatsAppQR);

// Route to send attendance reports to students via email & WhatsApp
router.post("/send-reports", sendAttendanceReportsToAllStudents);

// Route to send absentee messages to parents via WhatsApp
router.post("/send-absentees", sendAbsenteeMessages);

router.get("/status", getWhatsAppStatus);

router.post("/send-report/:studentId", sendStudentReport);

module.exports = router;
