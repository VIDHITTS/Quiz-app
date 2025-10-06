const Quiz = require("../models/quizModel.js");

async function createQuiz(req, res) {
  try {
    const { title, description, questions } = req.body;
    if (!title || !questions || questions.length === 0)
      return res.status(400).json({ message: "Title and questions required" });

    const quiz = new Quiz({
      title,
      description,
      questions,
      createdBy: req.user.id
    });

    await quiz.save();
    res.status(201).json({ message: "Quiz created successfully", quiz });
  } catch (err) {
    res.status(500).json({ message: "Error creating quiz", error: err.message });
  }
}

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

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  deleteQuiz
};
