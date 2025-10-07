const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashed });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    
    const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
    console.log('Register - Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      isProduction: isProduction
    });
    
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // Only secure in production
      sameSite: isProduction ? "none" : "lax", // none for cross-origin, lax for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    console.log('Register - Cookie settings:', {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax"
    });

    res.status(201).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d", // Match register expiry
    });

    const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
    console.log('Login - Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      RAILWAY_ENVIRONMENT: process.env.RAILWAY_ENVIRONMENT,
      isProduction: isProduction
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction, // Only secure in production
      sameSite: isProduction ? "none" : "lax", // none for cross-origin, lax for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days - match register
    });

    console.log('Login - Cookie settings:', {
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax"
    });

    res.json({ 
      success: true,
      message: "Logged in successfully",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function logout(req, res) {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT;
  
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction, // Only secure in production
    sameSite: isProduction ? "none" : "lax" // none for cross-origin, lax for localhost
  }).json({ success: true, message: "Logged out successfully" });
}

module.exports = {
  register,
  login,
  logout,
};
