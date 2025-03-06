  const db = require("../config/db");

  const createAttendanceTable = () => {
    const query = `CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(50) NOT NULL,
      attendance_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,  -- Default set to current timestamp
      status ENUM('Present','Absent') NOT NULL DEFAULT 'Absent',
      UNIQUE(student_id, attendance_date),
      FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
    )`;

    db.query(query, (err) => {
      if (err) {
        console.log("❌ Error in creating attendance table: ", err);
      } else {
        console.log("Attendance table ready!✅");
      }
    });
  };

  createAttendanceTable();
