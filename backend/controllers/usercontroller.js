const User = require("../models/user");
const Quiz = require("../models/quiz");
const Attempt = require("../models/attempt");
const mongoose = require("mongoose");

async function getProfile(req, res) {
  try {
    console.log('getProfile - User from middleware:', req.user?.id);
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      console.log('getProfile - User not found in database');
      return res.status(404).json({ error: "User not found" });
    }

    // get stats
    const quizCount = await Quiz.countDocuments({ createdBy: user._id });
    const attemptCount = await Attempt.countDocuments({ student: user._id });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        stats: {
          quizzesCreated: quizCount,
          quizzesTaken: attemptCount,
        },
      },
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, email } = req.body;
    const userId = req.user.id;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      message: "Profile updated successfully",
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error("Update profile error:", err);
    res.status(500).json({ error: err.message });
  }
}

// Get user dashboard data
async function getDashboard(req, res) {
  try {
    console.log('getDashboard - User from middleware:', req.user?.id);
    const userId = req.user.id;

    const myQuizzes = await Quiz.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title description createdAt questionsCount");

    const recentAttempts = await Attempt.find({ student: userId }); // Get stats
    const totalQuizzes = await Quiz.countDocuments({ createdBy: userId });
    const totalAttempts = await Attempt.countDocuments({ student: userId });

    // Get average score
    const avgScore = await Attempt.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, avgPercentage: { $avg: "$percentage" } } },
    ]);

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalQuizzes,
          totalAttempts,
          averageScore:
            avgScore.length > 0 ? Math.round(avgScore[0].avgPercentage) : 0,
        },
        recentQuizzes: myQuizzes,
        recentAttempts,
      },
    });
  } catch (err) {
    console.error("Get dashboard error:", err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
};
