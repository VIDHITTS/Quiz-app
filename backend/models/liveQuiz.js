const mongoose = require("mongoose");

const LiveQuizSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    roomCode: { type: String, required: true, unique: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["waiting", "in-progress", "completed"],
      default: "waiting",
    },
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        score: { type: Number, default: 0 },
        answers: [
          {
            questionIndex: Number,
            selectedOption: Number,
            isCorrect: Boolean,
            answeredAt: Date,
          },
        ],
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    currentQuestionIndex: { type: Number, default: 0 },
    questionOrder: [Number], // Random or sequential order
    timeLimit: { type: Number, default: 15 }, // Time limit in minutes
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("LiveQuiz", LiveQuizSchema);
