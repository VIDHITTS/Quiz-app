const dotenv = require("dotenv");

// need env variables
dotenv.config();

// Environment detection for Railway deployment
if (!process.env.NODE_ENV && process.env.RAILWAY_ENVIRONMENT) {
  process.env.NODE_ENV = 'production';
}

console.log('Environment:', process.env.NODE_ENV);

const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { register, login, logout } = require("./controllers/authcontroller.js");
const quizRoutes = require("./routes/quizroutes.js");
const attemptRoutes = require("./routes/attemptroutes.js");
const userRoutes = require("./routes/userroutes.js");

const app = express();

// allow frontend to connect
app.use(
  cors({
    origin: [
      "http://localhost:5173", 
      "http://localhost:5174",
      "https://quiz-app-beta-pearl.vercel.app"
    ],
    credentials: true, // Allow cookies to be sent
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  })
);

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());
app.use(cookieParser());

// log requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// login/register stuff
app.post("/register", register);
app.post("/login", login);
app.post("/logout", logout);

// test if server works
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
  });
});

// quiz stuff
app.use("/quizzes", quizRoutes);
app.use("/attempts", attemptRoutes);
app.use("/users", userRoutes);

const PORT = process.env.PORT || 3040;

// start server when db is ready
connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to DB, server not started", err);
    process.exit(1);
  });
