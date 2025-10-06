const express = require("express");
const {
  createQuiz,
  getAllQuizzes,
  getMyQuizzes,
  getQuizById,
  getQuizForAttempt,
  updateQuiz,
  deleteQuiz,
} = require("../controllers/quizcontrol.js");
const protect = require("../middleware/authmiddleware.js");

const router = express.Router();

// Public routes (no auth required)
router.get("/public", getAllQuizzes);
router.post("/:id/access", getQuizForAttempt);

// Protected routes (auth required)
router.use(protect);

router.post("/", createQuiz);
router.get("/my-quizzes", getMyQuizzes);
router.get("/:id", getQuizById);
router.put("/:id", updateQuiz);
router.delete("/:id", deleteQuiz);

module.exports = router;
