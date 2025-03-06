const db = require('../config/db');

// Function to create the admin table with college_status column
const createAdminTable = () => {
    const query = `
      CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(20) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `;
    db.query(query, (err) => {
      if (err) {
        console.log("❌Error in creating admin table: ", err);
      } else {
        console.log("Admin table ready!✅");
      }
    });
  };
  
  createAdminTable();

