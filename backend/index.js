const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');

const { register, login, logout } = require("./controllers/authcontroller.js");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cookieParser()); 

app.get("/register",register)
app.get("/login",login)
app.get("/logout",logout)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
