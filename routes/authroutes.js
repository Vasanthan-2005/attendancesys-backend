const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// Admin login route (No authentication needed)
router.post("/login", adminController.loginAdmin);

module.exports = router;
