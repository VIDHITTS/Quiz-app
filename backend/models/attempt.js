const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  answers: [{ questionId: mongoose.Schema.Types.ObjectId, selectedOption: String }],
  score: Number
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);
