const db = require("../config/db");

const getAttendanceReport = async (req, res) => {
  try {
    const { student_id } = req.params;

    if(!student_id){
      return res.status(404).json({message:"Student No Found"});
    }

    // Fetch student details
    const [studentResult] = await db
      .promise()
      .execute("SELECT name, parent_no FROM students WHERE student_id = ?", [
        student_id,
      ]);

    if (!studentResult || studentResult.length === 0) {
      return res.status(404).json({ message: "Student not found!" });
    }

    const { name: student_name, parent_no } = studentResult[0];

    // Get all months (considering both attendance and working days)
    const monthsQuery = `
      SELECT DISTINCT DATE_FORMAT(date, '%Y-%m') AS month FROM college_working_days
      UNION
      SELECT DISTINCT DATE_FORMAT(attendance_date, '%Y-%m') AS month FROM attendance WHERE student_id = ?
      ORDER BY month ASC
    `;
    const [monthsResult] = await db.promise().query(monthsQuery, [student_id]);

    if (!monthsResult || monthsResult.length === 0) {
      return res.json({ student_name, reports: [] });
    }

    let reports = [];

    for (const { month } of monthsResult) {
      // Get total working days for the month
      const totalDaysQuery = `
        SELECT COUNT(*) AS total_days 
        FROM college_working_days 
        WHERE DATE_FORMAT(date, '%Y-%m') = ?
      `;
      const [[{ total_days = 0 } = {}]] = await db.promise().query(totalDaysQuery, [month]);

      // Get present days for the student
      const presentDaysQuery = `
        SELECT COUNT(*) AS present_days
        FROM attendance
        WHERE student_id = ? AND status = 'Present' AND DATE_FORMAT(attendance_date, '%Y-%m') = ?
      `;
      const [[{ present_days = 0 } = {}]] = await db.promise().query(presentDaysQuery, [student_id, month]);

      // Calculate attendance percentage
      const attendance_percentage = total_days > 0 ? ((present_days / total_days) * 100).toFixed(2) : "0.00";

      // Store the report
      reports.push({
        month,
        present_days,
        total_days,
        attendance_percentage: `${attendance_percentage}%`,
        parent_no,
      });
    }

    res.json({ student_name, reports });
  } catch (error) {
    console.error("❌ Error fetching attendance report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { getAttendanceReport };
