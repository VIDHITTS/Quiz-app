const LiveQuiz = require("../models/liveQuiz");
const Quiz = require("../models/quiz");

// Generate a random 6-character room code
const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new live quiz room
exports.createLiveQuiz = async (req, res) => {
  try {
    const { quizId, randomizeQuestions, timeLimit } = req.body;
    const userId = req.user.id;

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Verify user owns the quiz
    if (quiz.createdBy.toString() !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to create live quiz for this quiz" });
    }

    // Generate unique room code
    let roomCode;
    let isUnique = false;
    while (!isUnique) {
      roomCode = generateRoomCode();
      const existing = await LiveQuiz.findOne({
        roomCode,
        status: { $ne: "completed" },
      });
      if (!existing) isUnique = true;
    }

    // Create question order (randomized or sequential)
    const questionOrder = randomizeQuestions
      ? quiz.questions.map((_, i) => i).sort(() => Math.random() - 0.5)
      : quiz.questions.map((_, i) => i);

    const liveQuiz = new LiveQuiz({
      title: quiz.title,
      description: quiz.description,
      quizId: quiz._id,
      roomCode,
      createdBy: userId,
      questionOrder,
      timeLimit: timeLimit || 15,
      participants: [],
    });

    await liveQuiz.save();

    res.json({
      success: true,
      liveQuiz: {
        id: liveQuiz._id,
        roomCode: liveQuiz.roomCode,
        title: liveQuiz.title,
        status: liveQuiz.status,
      },
    });
  } catch (error) {
    console.error("Error creating live quiz:", error);
    res.status(500).json({ error: "Failed to create live quiz" });
  }
};

// Get live quiz details
exports.getLiveQuiz = async (req, res) => {
  try {
    const { roomCode } = req.params;

    const liveQuiz = await LiveQuiz.findOne({ roomCode })
      .populate("quizId")
      .populate("createdBy", "name email");

    if (!liveQuiz) {
      return res.status(404).json({ error: "Live quiz not found" });
    }

    res.json({
      success: true,
      liveQuiz,
    });
  } catch (error) {
    console.error("Error getting live quiz:", error);
    res.status(500).json({ error: "Failed to get live quiz" });
  }
};

// Get all live quizzes created by user
exports.getUserLiveQuizzes = async (req, res) => {
  try {
    const userId = req.user.id;

    const liveQuizzes = await LiveQuiz.find({ createdBy: userId })
      .populate("quizId", "title")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      liveQuizzes,
    });
  } catch (error) {
    console.error("Error getting user live quizzes:", error);
    res.status(500).json({ error: "Failed to get live quizzes" });
  }
};

// Delete a live quiz
exports.deleteLiveQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const liveQuiz = await LiveQuiz.findById(id);
    if (!liveQuiz) {
      return res.status(404).json({ error: "Live quiz not found" });
    }

    if (liveQuiz.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await LiveQuiz.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Live quiz deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting live quiz:", error);
    res.status(500).json({ error: "Failed to delete live quiz" });
  }
};
