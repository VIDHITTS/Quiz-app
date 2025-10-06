const express = require('express');
const { createQuiz, getAllQuizzes, getQuizById, deleteQuiz } = require('../controllers/quizcontrol.js');
const protect = require('../middleware/authmiddleware.js');

const router = express.Router();

router.use(protect);

router.post('/createquiz', createQuiz);
router.get('/getquiz', getAllQuizzes);
router.get('/getquiz/:id', getQuizById);
router.delete('/deletequiz/:id', deleteQuiz);

module.exports = router;
