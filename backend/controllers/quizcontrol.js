const Quiz = require("../models/quiz.js");

async function createQuiz(req, res) {
  try {
    const { title, description, questions, isPublic, accessPin } = req.body;

    if (
      !title ||
      !questions ||
      !Array.isArray(questions) ||
      questions.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Title and questions array required" });
    }

    // Validate questions format
    for (let question of questions) {
      if (
        !question.text ||
        !question.options ||
        !Array.isArray(question.options) ||
        question.options.length < 2
      ) {
        return res.status(400).json({
          error: "Each question must have text and at least 2 options",
        });
      }

      const correctOptions = question.options.filter((opt) => opt.correct);
      if (correctOptions.length !== 1) {
        return res.status(400).json({
          error: "Each question must have exactly one correct option",
        });
      }
    }

    if (!isPublic && !accessPin) {
      return res.status(400).json({ error: "Private quiz requires a PIN" });
    }

    const quiz = await Quiz.create({
      title,
      description,
      questions,
      isPublic: isPublic !== false, // make public by default
      accessPin: isPublic !== false ? null : accessPin,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      quiz,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getAllQuizzes(req, res) {
  try {
    const { search, createdBy } = req.query;

    let filter = {}; // show all quizzes now

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (createdBy) {
      filter.createdBy = createdBy;
    }

    const quizzes = await Quiz.find(filter)
      .populate("createdBy", "name email")
      .select("-questions.options.correct -accessPin") // Hide correct answers and PIN
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getMyQuizzes(req, res) {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id })
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getQuizById(req, res) {
  try {
    const { includeAnswers } = req.query;
    const quiz = await Quiz.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Check if quiz is private and user has access
    if (!quiz.isPublic) {
      if (!req.user || quiz.createdBy._id.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ error: "Access denied. This is a private quiz." });
      }
    }

    // Hide correct answers unless user is the creator or explicitly requesting answers
    let responseQuiz = quiz.toObject();
    const isCreator = req.user && quiz.createdBy._id.toString() === req.user.id;

    if (!isCreator && includeAnswers !== "true") {
      responseQuiz.questions = responseQuiz.questions.map((q) => ({
        ...q,
        options: q.options.map((opt) => ({ text: opt.text, _id: opt._id })),
      }));
    }

    res.status(200).json({
      success: true,
      quiz: responseQuiz,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getQuizForAttempt(req, res) {
  try {
    const { accessPin } = req.body;
    const quiz = await Quiz.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Check access
    if (!quiz.isPublic) {
      if (!accessPin || accessPin !== quiz.accessPin) {
        return res.status(403).json({ error: "Incorrect access PIN" });
      }
    }

    // Return quiz without correct answers
    const responseQuiz = quiz.toObject();
    responseQuiz.questions = responseQuiz.questions.map((q) => ({
      ...q,
      options: q.options.map((opt) => ({ text: opt.text, _id: opt._id })),
    }));

    res.status(200).json({
      success: true,
      quiz: responseQuiz,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateQuiz(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { title, description, questions, isPublic, accessPin } = req.body;

    if (questions && Array.isArray(questions)) {
      // Validate questions format
      for (let question of questions) {
        if (
          !question.text ||
          !question.options ||
          !Array.isArray(question.options) ||
          question.options.length < 2
        ) {
          return res.status(400).json({
            error: "Each question must have text and at least 2 options",
          });
        }

        const correctOptions = question.options.filter((opt) => opt.correct);
        if (correctOptions.length !== 1) {
          return res.status(400).json({
            error: "Each question must have exactly one correct option",
          });
        }
      }
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(description && { description }),
        ...(questions && { questions }),
        ...(isPublic !== undefined && { isPublic }),
        ...(accessPin !== undefined && {
          accessPin: isPublic ? null : accessPin,
        }),
      },
      { new: true, runValidators: true }
    ).populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      quiz: updatedQuiz,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function deleteQuiz(req, res) {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTrendingQuizzes(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 6; // Default to 6 trending quizzes

    // Get trending public quizzes based on attempt count and recent activity
    const trendingQuizzes = await Quiz.aggregate([
      {
        // Only public quizzes
        $match: { isPublic: true },
      },
      {
        // Add attempt count from attempts collection
        $lookup: {
          from: "attempts",
          localField: "_id",
          foreignField: "quiz",
          as: "attempts",
        },
      },
      {
        // Add calculated fields
        $addFields: {
          attemptCount: { $size: "$attempts" },
          recentAttempts: {
            $size: {
              $filter: {
                input: "$attempts",
                cond: {
                  $gte: [
                    "$$this.createdAt",
                    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                  ], // Last 7 days
                },
              },
            },
          },
          trendingScore: {
            $add: [
              { $multiply: [{ $size: "$attempts" }, 1] }, // Total attempts weight
              {
                $multiply: [
                  {
                    $size: {
                      $filter: {
                        input: "$attempts",
                        cond: {
                          $gte: [
                            "$$this.createdAt",
                            new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                          ],
                        },
                      },
                    },
                  },
                  3,
                ], // Recent attempts weight (3x multiplier)
              },
            ],
          },
        },
      },
      {
        // Remove attempts array and sensitive data
        $project: {
          attempts: 0,
          "questions.options.correct": 0,
          accessPin: 0,
        },
      },
      {
        // Populate creator info
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      {
        // Format creator info
        $addFields: {
          createdBy: {
            $arrayElemAt: [
              {
                $map: {
                  input: "$createdBy",
                  as: "user",
                  in: {
                    _id: "$$user._id",
                    name: "$$user.name",
                    email: "$$user.email",
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        // Sort by trending score (highest first)
        $sort: { trendingScore: -1, createdAt: -1 },
      },
      {
        // Limit results
        $limit: limit,
      },
    ]);

    res.status(200).json({
      success: true,
      count: trendingQuizzes.length,
      data: trendingQuizzes,
    });
  } catch (error) {
    console.error("Error fetching trending quizzes:", error);
    res.status(500).json({ error: "Failed to fetch trending quizzes" });
  }
}

async function getQuizResults(req, res) {
  try {
    const { id } = req.params;
    const Attempt = require("../models/attempt.js");

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to view results" });
    }

    const attempts = await Attempt.find({ quiz: id })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    const results = attempts.map((attempt) => ({
      id: attempt._id,
      studentName: attempt.student.name,
      studentEmail: attempt.student.email,
      score: attempt.score,
      totalQuestions: attempt.totalQuestions,
      percentage: attempt.percentage,
      attemptedAt: attempt.createdAt,
      answers: attempt.answers,
    }));

    const stats = {
      totalAttempts: attempts.length,
      averageScore:
        attempts.length > 0
          ? (
              attempts.reduce((sum, a) => sum + a.percentage, 0) /
              attempts.length
            ).toFixed(1)
          : 0,
      highestScore:
        attempts.length > 0
          ? Math.max(...attempts.map((a) => a.percentage))
          : 0,
      lowestScore:
        attempts.length > 0
          ? Math.min(...attempts.map((a) => a.percentage))
          : 0,
    };

    res.status(200).json({
      success: true,
      quiz: {
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.questions.length,
      },
      stats,
      results,
    });
  } catch (error) {
    console.error("Error fetching quiz results:", error);
    res.status(500).json({ error: "Failed to fetch quiz results" });
  }
}

module.exports = {
  createQuiz,
  getAllQuizzes,
  getMyQuizzes,
  getQuizById,
  getQuizForAttempt,
  updateQuiz,
  deleteQuiz,
  getTrendingQuizzes,
  getQuizResults,
};
