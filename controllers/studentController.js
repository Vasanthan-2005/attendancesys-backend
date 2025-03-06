const db = require("../config/db");

exports.registerStudent = async (req, res) => {
    try {
        const { student_id, name, email, department, parent_no } = req.body;

        // Ensure all fields are provided
        if (!student_id || !name || !email || !department || !parent_no) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if student already exists based on student ID
        db.query("SELECT * FROM students WHERE student_id = ?", [student_id], (err, results) => {
            if (err) return res.status(500).json({ error: "Database Error" });

            if (results.length > 0) {
                return res.status(400).json({ error: "Student ID exists" });
            }

            // Check if email already exists
            db.query("SELECT * FROM students WHERE email = ?", [email], (err, results) => {
                if (err) return res.status(500).json({ error: "Database Error" });

                if (results.length > 0) {
                    return res.status(400).json({ error: "Email already exists" });
                }

                // Check if parent phone number already exists
                db.query("SELECT * FROM students WHERE parent_no = ?", [parent_no], (err, results) => {
                    if (err) return res.status(500).json({ error: "Database Error" });

                    if (results.length > 0) {
                        return res.status(400).json({ error: "Parent phone number already exists" });
                    }

                    // Insert the new student record into the database
                    db.query("INSERT INTO students (student_id, name, email, department, parent_no) VALUES (?, ?, ?, ?, ?)",
                        [student_id, name, email, department, parent_no],
                        (err) => {
                            if (err) return res.status(500).json({ error: "Error inserting student" ,error:err.message});
                            res.status(201).json({ message: "Student registered successfully!" });
                        });
                });
            });
        });
    } catch (error) {
        console.error("Error registering student:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
