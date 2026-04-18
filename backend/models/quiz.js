const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    questions: [
      {
        text: String,
        options: [{ text: String, correct: Boolean }],
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isPublic: { type: Boolean, default: true },
    isLiveQuiz: { type: Boolean, default: false },
    accessPin: { type: String, default: null },
    timeLimit: { type: Number, default: 15 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);
