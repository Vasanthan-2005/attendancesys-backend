const jwt = require("jsonwebtoken");
const db = require("../config/db");
const fs = require("fs");
const path = require("path");

const loginAdmin = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const sql = "SELECT * FROM admin WHERE username = ?";
  db.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Database Error:", err.message);
      return res.status(500).json({ message: "Server error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const admin = results[0];

    // Direct password comparison (No Hashing)
    if (password !== admin.password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables!");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  });
};

// Update the college status (ON/OFF)
const updateCollegeStatus = (req, res) => {
  const { status } = req.body;

  console.log("Authenticated User:", req.user);
  console.log("Requested Status:", req.body.status);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Unauthorized: Invalid user" });
  }

  if (!status || (status !== "ON" && status !== "OFF")) {
    return res.status(400).json({
      message: 'Invalid college status. Please provide "ON" or "OFF".',
    });
  }

  const updateQuery = "UPDATE college_status SET status = ? WHERE id = 1"; // Assuming single admin record
  db.query(updateQuery, [status], (err) => {
    if (err) {
      return res.status(500).json({
        message: "Error updating college status",
        error: err.message,
      });
    }

    res.status(200).json({
      message: `College status updated to ${status}`,
    });
  });
};

// Get all students
const getAllStudents = (req, res) => {
  db.query("SELECT * FROM students", (err, results) => {
    if (err) return res.status(500).json({ error: "Database Error" });
    res.status(200).json(results);
  });
};

// Get student by ID
const getStudentById = (req, res) => {
  const { student_id } = req.params;
  db.query(
    "SELECT * FROM students WHERE student_id = ?",
    [student_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Database Error" });
      if (results.length === 0)
        return res.status(404).json({ error: "🛑 Student not found" });
      res.status(200).json(results[0]);
    }
  );
};

// Update student details
const updateStudent = (req, res) => {
  const { student_id } = req.params;
  const updatedData = req.body;

  db.query(
    "UPDATE students SET ? WHERE student_id = ?",
    [updatedData, student_id],
    (err) => {
      if (err) return res.status(500).json({ error: "Database Error" });
      res.status(200).json({ message: "Student updated successfully!" });
    }
  );
};

// Delete student
const FACE_DB_PATH = "C:/Users/vasan/Desktop/project/backend/face_recognition/db";
const UPLOADS_PATH = "C:/Users/vasan/Desktop/project/backend/face_recognition/uploads";

const deleteStudent = (req, res) => {
  const { student_id } = req.params;
  db.query("DELETE FROM students WHERE student_id = ?", [student_id], (err) => {
    if (err) return res.status(500).json({ error: "Database Error" });

    const pickleFile = path.join(FACE_DB_PATH, `${student_id}.pickle`);
    const imageFile = path.join(UPLOADS_PATH, `${student_id}.jpg`);

    // Delete pickle file if it exists
    if (fs.existsSync(pickleFile)) {
      fs.unlinkSync(pickleFile);
      console.log(`Deleted: ${pickleFile}`);
    }

    // Delete image file if it exists
    if (fs.existsSync(imageFile)) {
      fs.unlinkSync(imageFile);
      console.log(`Deleted: ${imageFile}`);
    }

    res.status(200).json({ message: "Student deleted successfully!" });
  });
};

const seeAbsentees = (req, res) => {
  const query = `SELECT s.student_id, s.name, s.email
FROM students s
LEFT JOIN attendance a 
  ON s.student_id = a.student_id AND DATE(a.attendance_date) = CURDATE()
WHERE a.status != 'Present' OR a.attendance_date IS NULL
ORDER BY s.name;
`;
  db.query(query, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error in fetching students", error: err.message });
    }
    if (result.length == 0) {
      return res.status(404).json({ message: "No absentees Today" });
    }
    res.status(200).json(result);
  });
};

const getCollegeStatus = (req, res) => {
  const sql = "SELECT status FROM college_status WHERE id = 1"; // Assuming single row for status
  db.query(sql, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Server error", error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "College status not found" });
    }
    const status = result[0].status;

    if (status === "OFF") {
      removeWorkingDay();
    }
    if (status === "ON") {
      insertWorkingDay();
    }
    res.json({ status });
  });
};

const removeWorkingDay = () => {
  const today = new Date().toISOString().split("T")[0];

  const deleteQuery = `DELETE FROM college_working_days WHERE date = ?`;
  db.query(deleteQuery, [today], (err, result) => {
    if (err) {
      console.log("❌ Error deleting working day:", err);
    } else if (result.affectedRows > 0) {
      console.log("✅ Working day removed:", today);
    } else {
      console.log("ℹ️ No working day entry found for:", today);
    }
  });
};

const insertWorkingDay = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const query =
      "INSERT INTO college_working_days (date) VALUES (?) ON DUPLICATE KEY UPDATE date = date";
    db.query(query, [today], (err, result) => {
      if (err) {
        console.error("Error inserting working day:", err);
      } else {
        console.log("✅ Working day recorded:", today);
      }
    });
  } catch (error) {
    console.error("Server error:", error);
  }
};

module.exports = {
  loginAdmin,
  getCollegeStatus,
  updateCollegeStatus,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  seeAbsentees,
};
