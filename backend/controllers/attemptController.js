const Attempt = require("../models/attempt");
const Quiz = require("../models/quiz");

async function submitAttempt(req, res) {
  try {
    const { quizId, answers } = req.body;
    const userId = req.user.id;

    if (!quizId || !answers || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ error: "Quiz ID and answers array required" });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // figure out the score
    let score = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((question, index) => {
      const userAnswer = answers.find(
        (a) => a.questionId === question._id.toString()
      );
      if (userAnswer) {
        const correctOption = question.options.find((opt) => opt.correct);
        if (correctOption && userAnswer.selectedOption === correctOption.text) {
          score++;
        }
      }
    });

    // Create attempt
    const attempt = await Attempt.create({
      quiz: quizId,
      student: userId,
      answers,
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
    });

    await attempt.populate("quiz", "title description");

    res.status(201).json({
      success: true,
      attempt,
      score,
      totalQuestions,
      percentage: Math.round((score / totalQuestions) * 100),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUserAttempts(req, res) {
  try {
    const userId = req.user.id;
    const attempts = await Attempt.find({ student: userId })
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
    if (
      attempt.student._id.toString() !== req.user.id &&
      attempt.quiz.createdBy.toString() !== req.user.id
    ) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(attempt);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Get quiz attempts (for quiz creators)
async function getQuizAttempts(req, res) {
  try {
    const { quizId } = req.params;

    // Verify user owns the quiz
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const attempts = await Attempt.find({ quiz: quizId })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.json(attempts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  submitAttempt,
  getUserAttempts,
  getAttemptById,
  getQuizAttempts,
};
