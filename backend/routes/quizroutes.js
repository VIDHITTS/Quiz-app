const express = require('express');
const { createQuiz, getAllQuizzes, getPublicQuizzes, getMyQuizzes, getQuizById, deleteQuiz } = require('../controllers/quizcontrol.js');
const protect = require('../middleware/authmiddleware.js');

const router = express.Router();

router.use(protect);

router.post('/createquiz', createQuiz);
router.get('/getquiz', getAllQuizzes);
router.get('/public', getPublicQuizzes);
router.get('/my-quizzes', getMyQuizzes);
router.get('/getquiz/:id', getQuizById);
router.delete('/deletequiz/:id', deleteQuiz);

module.exports = router;
