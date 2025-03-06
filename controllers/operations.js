const db = require("../config/db");

// Get total number of students
const getTotalStudents = (req, res) => {
  const query = `SELECT COUNT(*) AS total_students FROM students`;

  db.query(query, (err, result) => {
    if (err) {
      console.log("❌ Error fetching total students:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ total_students: result[0].total_students });
  });
};

// Get total working days
const getTotalWorkingDays = (req, res) => {
  const query = `
    SELECT COUNT(*) AS total_days 
    FROM college_working_days 
    WHERE MONTH(date) = MONTH(CURRENT_DATE()) 
      AND YEAR(date) = YEAR(CURRENT_DATE())
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.log("❌ Error fetching working days count:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ total_working_days: result[0].total_days });
  });
};

// Get number of present students for today
const getPresentStudents = (req, res) => {
  const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
  const query = `SELECT COUNT(DISTINCT student_id) AS present_students FROM attendance WHERE attendance_date = ?`;

  db.query(query, [today], (err, result) => {
    if (err) {
      console.log("❌ Error fetching present students:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ present_students: result[0].present_students });
  });
};

// Get number of absent students for today
const getAbsentStudents = (req, res) => {
  const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD

  const totalStudentsQuery = `SELECT COUNT(*) AS total_students FROM students`;
  const presentStudentsQuery = `SELECT COUNT(DISTINCT student_id) AS present_students FROM attendance WHERE attendance_date = ?`;

  db.query(totalStudentsQuery, (err, totalResult) => {
    if (err) {
      console.log("❌ Error fetching total students:", err);
      return res.status(500).json({ error: "Database error" });
    }

    const totalStudents = totalResult[0].total_students;

    db.query(presentStudentsQuery, [today], (err, presentResult) => {
      if (err) {
        console.log("❌ Error fetching present students:", err);
        return res.status(500).json({ error: "Database error" });
      }

      const presentStudents = presentResult[0].present_students;
      const absentStudents = totalStudents - presentStudents;

      res.json({ absent_students: absentStudents });
    });
  });
};

module.exports = {
  getTotalStudents,
  getTotalWorkingDays,
  getPresentStudents,
  getAbsentStudents,
};
