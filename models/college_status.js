const db = require("../config/db");

const createCollegeStatusTable = () => {
  const query = `
        CREATE TABLE IF NOT EXISTS college_status (
            id INT AUTO_INCREMENT PRIMARY KEY,
            status VARCHAR(3) NOT NULL DEFAULT 'ON',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `;

  db.query(query, (err) => {
    if (err) {
      console.log("❌ Error in creating college status table:", err);
    } else {
      console.log("College status table ready! ✅");
      insertDefaultStatus(); // Call function to insert default status
    }
  });
};

const insertDefaultStatus = () => {
  const checkQuery = `SELECT COUNT(*) AS count FROM college_status`;

  db.query(checkQuery, (err, result) => {
    if (err) {
      console.log("❌ Error checking college status records:", err);
    } else {
      const count = result[0].count;
      if (count === 0) {
        const insertQuery = `INSERT INTO college_status (status) VALUES ('ON')`;
        db.query(insertQuery, (err) => {
          if (err) console.log("❌ Error inserting default college status:", err);
          else console.log("✅ Default college status set to 'ON'");
        });
      }
    }
  });
};

const createWorkingDaysTable = () => {
  const query = `
        CREATE TABLE IF NOT EXISTS college_working_days (
            id INT AUTO_INCREMENT PRIMARY KEY,
            date DATE NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

  db.query(query, (err) => {
    if (err) {
      console.log("❌ Error creating college_working_days table:", err);
    } else {
      console.log("College working days table ready!✅ ");
    }
  });
};

// Initialize tables
createCollegeStatusTable();
createWorkingDaysTable();