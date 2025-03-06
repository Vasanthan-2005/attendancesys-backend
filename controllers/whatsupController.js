const { Client, LocalAuth } = require("whatsapp-web.js");
const qrCode = require("qrcode");
const nodemailer = require("nodemailer");
const db = require("../config/db");

let client;
let isClientReady = false;
let qrImage = null;

// Initialize WhatsApp Client
const initializeClient = () => {
  console.log("Initializing WhatsApp client...");

  client = new Client({
    authStrategy: new LocalAuth(),
  });

  client.on("qr", async (qr) => {
    console.log("📲 Scan the QR code to log in.");
    try {
      qrImage = await qrCode.toDataURL(qr);
    } catch (err) {
      console.error("❌ Error generating QR Code:", err);
    }
  });

  client.on("ready", () => {
    console.log("✅ WhatsApp client is ready!");
    isClientReady = true;
    qrImage = null; // Reset QR code after successful login
  });

  client.on("authenticated", () => {
    console.log("🔑 WhatsApp authenticated successfully!");
  });

  client.on("auth_failure", (message) => {
    console.error("❌ Authentication failed:", message);
    restartClient();
  });

  client.on("disconnected", (reason) => {
    console.warn("❌ WhatsApp client disconnected:", reason);
    isClientReady = false;
    restartClient();
  });

  client.initialize();
};

// Restart client on failure
const restartClient = () => {
  console.log("♻️ Restarting WhatsApp client...");
  client.destroy();
  setTimeout(initializeClient, 5000); // Retry after 5 seconds
};

// Initialize client at start
initializeClient();

// Get WhatsApp connection status
const getWhatsAppStatus = (req, res) => {
  res.json({ isConnected: isClientReady });
};

// Get WhatsApp QR Code
const getWhatsAppQR = (req, res) => {
  if (!qrImage) {
    return res
      .status(404)
      .json({ message: "QR Code not available. Please wait." });
  }
  res.json({ qr: qrImage });
};

// Send attendance reports to all students (via email and WhatsApp)
const sendAttendanceReportsToAllStudents = async (req, res) => {
  try {
    const [students] = await db
      .promise()
      .query("SELECT student_id, email, parent_no FROM students");

    if (students.length === 0) {
      return res.json({ message: "No students found!" });
    }

    for (const student of students) {
      const reportText = await generateAttendanceReport(student.student_id);
      await sendEmail(student.email, `Attendance Report`, reportText);
      await sendWhatsAppMessage(student.parent_no, reportText);
    }

    res.status(200).json({ message: "Attendance reports sent successfully!" });
  } catch (err) {
    console.error("❌ Error in sending reports:", err.message);
    res.status(500).json({ error: "Failed to send reports." });
  }
};

const sendStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params; // Get student ID from request
    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const reportText = await generateAttendanceReport(studentId);

    const [studentResult] = await db
      .promise()
      .query("SELECT email, parent_no,name FROM students WHERE student_id = ?", [
        studentId,
      ]);

    if (studentResult.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const { email, parent_no } = studentResult[0];

    if (parent_no) {
      await sendWhatsAppMessage(parent_no, reportText);
    }

    if (email) {
      await sendEmail(email, "Attendance Report", reportText);
    }
 
    return res.status(200).json({ message: `Report sent successfully to ${studentResult[0].name}.` });
  } catch (error) {
    console.error("❌ Error sending student report:", error.message);
    return res.status(500).json({ message: "Failed to send report" });
  }
};


const sendAbsenteeMessages = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [absentees] = await db.promise().query(
      `SELECT s.name, s.parent_no 
       FROM students s
       WHERE NOT EXISTS (
         SELECT 1 FROM attendance a 
         WHERE s.student_id = a.student_id 
         AND DATE(a.attendance_date) = ?
       )`,
      [today]
    );

    if (absentees.length === 0) {
      return res.json({ message: "No absentees today!" });
    }

    for (const student of absentees) {
      const message = `Dear Parent, your child ${student.name} was absent today. Please ensure they attend regularly.`;
      await sendWhatsAppMessage(student.parent_no, message);
    }

    res.json({ success: true, message: "Absentee messages sent!" });
  } catch (error) {
    console.error("❌ Error sending absentee messages:", error);
    res.status(500).json({ error: "Failed to send absentee messages" });
  }
};

// Send email with attendance report
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to: ${to}`);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};

// Send WhatsApp message
const sendWhatsAppMessage = async (parent_no, text) => {
  try {
    if (!isClientReady) {
      console.error("❌ WhatsApp client is not ready! Reconnecting...");
      return;
    }
    await client.sendMessage(`91${parent_no}@c.us`, text);
    console.log(`✅ WhatsApp message sent to: ${parent_no}`);
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error.message);
  }
};

// Generate attendance report for a student
const generateAttendanceReport = async (student_id) => {
  try {
    const [studentResult] = await db
      .promise()
      .query("SELECT name, parent_no FROM students WHERE student_id = ?", [
        student_id,
      ]);

    if (studentResult.length === 0) {
      throw new Error("Student not found!");
    }

    const { name, parent_no } = studentResult[0];

    // Fetch all months from working days and attendance to cover all cases
    const [monthsResult] = await db.promise().query(
      `SELECT DISTINCT DATE_FORMAT(date, '%Y-%m') AS month FROM college_working_days
       UNION 
       SELECT DISTINCT DATE_FORMAT(attendance_date, '%Y-%m') AS month FROM attendance WHERE student_id = ?
       ORDER BY month ASC`,
      [student_id]
    );

    if (monthsResult.length === 0) {
      return "No attendance records found for this student.";
    }

    let reportText = `📜 Attendance Report:\n`;

    for (const { month } of monthsResult) {
      // Get total working days for the month
      const [[totalDaysResult]] = await db
        .promise()
        .query(
          `SELECT COUNT(*) AS total_days FROM college_working_days WHERE DATE_FORMAT(date, '%Y-%m') = ?`,
          [month]
        );
      const totalWorkingDays = totalDaysResult.total_days || 0;

      // Get present days for the student
      const [[presentDaysResult]] = await db.promise().query(
        `SELECT COUNT(*) AS present_days FROM attendance 
         WHERE student_id = ? AND status = 'Present' 
         AND DATE_FORMAT(attendance_date, '%Y-%m') = ?`,
        [student_id, month]
      );
      const presentDays = presentDaysResult.present_days || 0;

      // Calculate attendance percentage
      const attendancePercentage =
        totalWorkingDays > 0
          ? ((presentDays / totalWorkingDays) * 100).toFixed(2) + "%"
          : "0%";

      // Add report details
      reportText += `-------------------------------------\n`;
      reportText += `Student Name  : ${name}\n`;
      reportText += `Parent Number : ${parent_no}\n`;
      reportText += `Month         : ${month}\n`;
      reportText += `Present Days  : ${presentDays}\n`;
      reportText += `Total Days    : ${totalWorkingDays}\n`;
      reportText += `Attendance %  : ${attendancePercentage}\n`;
      reportText += `-------------------------------------\n`;
    }

    return reportText;
  } catch (error) {
    console.error("❌ Error generating attendance report:", error.message);
    throw error;
  }
};

// Export functions
module.exports = {
  getWhatsAppQR,
  sendAttendanceReportsToAllStudents,
  sendAbsenteeMessages,
  getWhatsAppStatus,
  sendStudentReport,
};
