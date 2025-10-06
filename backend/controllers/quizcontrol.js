const Quiz = require("../models/quiz.js");

async function createQuiz(req, res) {
  try {
    const { title, description, questions, isPublic, accessPin } = req.body;

    if (!title || !questions) {
      return res.status(400).json({ error: "Title and questions required" });
    }

    if (!isPublic && !accessPin) {
      return res.status(400).json({ error: "Private quiz requires a PIN" });
    }

    const quiz = await Quiz.create({
      title,
      description,
      questions,
      isPublic,
      accessPin: isPublic ? null : accessPin,
      createdBy: req.user._id
    });

    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

async function getAllQuizzes(req, res) {
  try {
    const quizzes = await Quiz.find().populate("createdBy", "name email");
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quizzes", error: err.message });
  }
}

async function getQuizById(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("createdBy", "name email");
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.status(200).json(quiz);
  } catch (err) {
    res.status(500).json({ message: "Error fetching quiz", error: err.message });
  }
}

async function deleteQuiz(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    if (quiz.createdBy.toString() !== req.user.id)
      return res.status(403).json({ message: "Unauthorized" });

    await quiz.deleteOne();
    res.status(200).json({ message: "Quiz deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting quiz", error: err.message });
  }
}

async function getPublicQuizzes(req, res) {
  try {
    const quizzes = await Quiz.find({ isPublic: true }).populate("createdBy", "name email");
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching public quizzes", error: err.message });
  }
}

async function getMyQuizzes(req, res) {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id }).populate("createdBy", "name email");
    res.status(200).json(quizzes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your quizzes", error: err.message });
  }
}

module.exports = {
  createQuiz,
  getAllQuizzes,
  getPublicQuizzes,
  getMyQuizzes,
  getQuizById,
  deleteQuiz
};
