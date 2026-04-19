const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authmiddleware");
const {
  createLiveQuiz,
  getLiveQuiz,
  getUserLiveQuizzes,
  deleteLiveQuiz,
} = require("../controllers/liveQuizController");

router.post("/", authenticateToken, createLiveQuiz);
router.get("/my-live-quizzes", authenticateToken, getUserLiveQuizzes);
router.get("/:roomCode", getLiveQuiz);
router.delete("/:id", authenticateToken, deleteLiveQuiz);

module.exports = router;
