const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/user.js'); 
const Quiz = require('./models/quiz.js');
const Attempt = require('./models/attempt.js');
dotenv.config();
connectDB();

const app = express(); 

app.use(express.json());


app.get('/test', async (req, res) => {
    console.log("got here");
  try {
    const user = await User.create({ name: "Alice", email: "alice@test.com", password: "123" });

    const quiz = await Quiz.create({
      title: "Sample Quiz",
      description: "Math quiz",
      questions: [
        {
          text: "2 + 2 = ?",
          options: [
            { text: "3", correct: false },
            { text: "4", correct: true }
          ]
        }
      ],
      createdBy: user._id
    });

    const attempt = await Attempt.create({
      quiz: quiz._id,
      student: user._id,
      answers: [{ questionId: quiz.questions[0]._id, selectedOption: "4" }],
      score: 1
    });

    res.json({ user, quiz, attempt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
