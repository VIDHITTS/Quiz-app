const express = require('express');
const { 
  createQuiz, 
  getAllQuizzes, 
  getMyQuizzes,
  getQuizById, 
  getQuizForAttempt,
  updateQuiz,
  deleteQuiz 
} = require('../controllers/quizcontrol.js');
const protect = require('../middleware/authmiddleware.js');

const router = express.Router();

// Public routes (no auth required)
router.get('/public', getAllQuizzes); // Get all public quizzes
router.post('/:id/access', getQuizForAttempt); // Get quiz for taking (with PIN check)

// Protected routes (auth required)
router.use(protect);

router.post('/', createQuiz); // Create quiz
router.get('/my-quizzes', getMyQuizzes); // Get user's quizzes
router.get('/:id', getQuizById); // Get quiz by ID
router.put('/:id', updateQuiz); // Update quiz
router.delete('/:id', deleteQuiz); // Delete quiz

module.exports = router;
