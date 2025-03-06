const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root123',
    database: process.env.DB_NAME || 'attendance_sys',
    multipleStatements: true,  // Allows multiple queries in a single call (optional, based on needs)
});

db.connect((err) => {
    if (err) {
        console.error("❌ Error in DB connection: ", err.message);
    } else {
        console.log("✅ DB Connected successfully");
    }
});

module.exports = db;
