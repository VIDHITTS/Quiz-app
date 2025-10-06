const dotenv = require('dotenv');

// load env variables first
dotenv.config();

const express = require('express');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

const { register, login, logout } = require('./controllers/authcontroller.js');
const quizRoutes = require('./routes/quizroutes.js');
const attemptRoutes = require('./routes/attemptroutes.js');
const userRoutes = require('./routes/userroutes.js');

const app = express();

app.use(express.json());
app.use(cookieParser());

// middleware: simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// auth routes (POST)
app.post('/register', register);
app.post('/login', login);
app.post('/logout', logout);

// simple test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// quiz routes
app.use('/quizzes', quizRoutes);
app.use('/attempts', attemptRoutes);
app.use('/users', userRoutes);

const PORT = process.env.PORT || 3040;

// start server after DB connection is successful
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to DB, server not started', err);
    process.exit(1);
  });
