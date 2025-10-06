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
    accessPin: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);
