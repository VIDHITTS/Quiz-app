const express = require("express");
const {
  submitAttempt,
  getUserAttempts,
  getAttemptById,
  getQuizAttempts,
} = require("../controllers/attemptcontroller.js");
const protect = require("../middleware/authmiddleware.js");

const router = express.Router();

// All attempt routes require authentication
router.use(protect);

// Submit quiz attempt
router.post("/submit", submitAttempt);

// Get user's attempts
router.get("/my-attempts", getUserAttempts);

// Get specific attempt
router.get("/:id", getAttemptById);

// Get all attempts for a quiz (quiz creators only)
router.get("/quiz/:quizId", getQuizAttempts);

module.exports = router;
