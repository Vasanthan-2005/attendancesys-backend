const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // Attach user data to request
    next();
  } catch (err) {
    console.log("Token Verification Error:", err.message); // Log if verification fails
    return res.status(401).json({ message: `Invalid token: ${err.message}` });
  }
};

module.exports = { authenticateToken };
