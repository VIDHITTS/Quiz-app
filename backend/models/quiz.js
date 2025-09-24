const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  title: String,
  description: String,
  questions: [
    {
      text: String,
      options: [{ text: String, correct: Boolean }]
    }
  ],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
