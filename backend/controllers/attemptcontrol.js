const Attempt = require("../models/attempt.js");
const Quiz = require("../models/quiz.js");

async function submitAttempt(req, res) {
  try {
    const { quizId, answers } = req.body;

    if (!quizId || !answers) {
      return res.status(400).json({ error: "Quiz ID and answers required" });
    }

    // Get the quiz to calculate score
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Calculate score
    let score = 0;
    answers.forEach(answer => {
      const question = quiz.questions.id(answer.questionId);
      if (question) {
        const correctOption = question.options.find(opt => opt.correct);
        if (correctOption && correctOption.text === answer.selectedOption) {
          score++;
        }
      }
    });

    const attempt = await Attempt.create({
      quiz: quizId,
      student: req.user.id,
      answers,
      score
    });

    res.status(201).json({ attempt, totalQuestions: quiz.questions.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUserAttempts(req, res) {
  try {
    const attempts = await Attempt.find({ student: req.user.id })
      .populate("quiz", "title description")
      .sort({ createdAt: -1 });
    
    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAttemptById(req, res) {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate("quiz")
      .populate("student", "name email");
    
    if (!attempt) {
      return res.status(404).json({ error: "Attempt not found" });
    }

    // Check if user owns this attempt or is the quiz creator
    if (attempt.student._id.toString() !== req.user.id && 
        attempt.quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(attempt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  submitAttempt,
  getUserAttempts,
  getAttemptById
};