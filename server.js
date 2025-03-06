require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");

require("./models/studentmodel");
require("./models/attendancemodel");
require("./models/adminmodel");
require("./models/college_status");

const studentRoutes = require("./routes/studentroutes");
const attendanceRoutes = require("./routes/attendanceroutes");
const adminRoutes = require("./routes/adminroutes");
const whatsuproutes=require("./routes/whatsuproutes");
const authRoutes = require("./routes/authroutes");
const operationsRoutes = require("./routes/operationroutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/whatsapp",whatsuproutes);
app.use("/api/auth", authRoutes);
app.use("/api/operations",operationsRoutes);

app.get("/recognize", (req, res) => {
  res.send("Use POST instead!");
});

app.get("/", (req, res) => {
  res.send("✅ Attendance API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
