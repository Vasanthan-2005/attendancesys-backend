const db = require("../config/db");

const markAttendance = (req, res) => {
  const { student_id } = req.body;

  if (!student_id) {
    return res.status(400).json({ message: "Student ID is required" });
  }

  const checkStudentQuery = "SELECT student_id, name FROM students WHERE student_id = ?";
  db.query(checkStudentQuery, [student_id], (err, studentResult) => {
    if (err) {
      return res.status(500).json({ message: "Error checking student", error: err.message });
    }

    if (studentResult.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("Student Result:", studentResult); // Debugging

    const name  = studentResult[0].name;
    const today = new Date().toISOString().split("T")[0];

    const checkAttendanceQuery = "SELECT * FROM attendance WHERE student_id = ? AND attendance_date = ?";
    db.query(checkAttendanceQuery, [student_id, today], (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error checking attendance", error: err.message });
      }

      if (result.length > 0) {
        return res.status(400).json({ message: "Attendance already marked for today" });
      }

      // Mark attendance
      const markAttendanceQuery = "INSERT INTO attendance (student_id, attendance_date, status) VALUES (?, ?, 'Present')";
      db.query(markAttendanceQuery, [student_id, today], (err) => {
        if (err) {
          return res.status(500).json({ message: "Error marking attendance", error: err.message });
        }
        return res.status(201).json({ message: `Attendance marked for ${name}` });
      });
    });
  });
};

const getCollegeStatus = (req, res) => {
  const query = "SELECT status FROM college_status ORDER BY id DESC LIMIT 1";

  db.query(query, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching college status", error: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "No status record found" });
    }

    res.status(200).json({
      status: results[0].status,
    });
  });
};

module.exports = {
  markAttendance,
  getCollegeStatus,
};
