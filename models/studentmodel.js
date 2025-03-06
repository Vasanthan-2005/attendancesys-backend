const db = require("../config/db");

const createStudentTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS students (
            id INT AUTO_INCREMENT PRIMARY KEY,
            student_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            department VARCHAR(50) NOT NULL,
            parent_no VARCHAR(15) UNIQUE NOT NULL
        )
    `;

    db.query(query, (err) => {
        if (err) console.log("❌ Error in creating student table:", err);
        else console.log("Students table ready!✅");
    });
};

createStudentTable();
