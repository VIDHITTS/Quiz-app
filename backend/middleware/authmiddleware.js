const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: "Access denied. No token provided." 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");
      
      if (!user) {
        return res.status(401).json({ 
          success: false,
          error: "Token is valid but user no longer exists." 
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError.message);
      return res.status(401).json({ 
        success: false,
        error: "Invalid token." 
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ 
      success: false,
      error: "Server error in authentication." 
    });
  }
};
