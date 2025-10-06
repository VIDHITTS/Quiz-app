# Quiz App Backend

A Node.js/Express backend for a quiz application with user authentication, quiz creation, and attempt tracking.

## Features

- User authentication (register, login, logout) with JWT tokens
- Quiz creation and management
- Quiz attempts with automatic scoring
- Protected routes with authentication middleware
- MongoDB data persistence

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
PORT=3451
MONGO_URI=mongodb://127.0.0.1:27017/quizapp
JWT_SECRET=your_jwt_secret_here
```

3. Start MongoDB locally

4. Run the server:
```bash
# Development (with auto-restart)
nodemon index.js

# Production
npm start
```

## API Endpoints

### Authentication
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user

### Quizzes (Protected)
- `POST /quizzes/createquiz` - Create a new quiz
- `GET /quizzes/getquiz` - Get all quizzes
- `GET /quizzes/public` - Get public quizzes only
- `GET /quizzes/my-quizzes` - Get current user's quizzes
- `GET /quizzes/getquiz/:id` - Get specific quiz
- `DELETE /quizzes/deletequiz/:id` - Delete quiz (owner only)

### Attempts (Protected)
- `POST /attempts/submit` - Submit quiz attempt
- `GET /attempts/my-attempts` - Get user's attempts
- `GET /attempts/:id` - Get specific attempt

### Test
- `GET /api/test` - Test endpoint to verify server is running

## Authentication

All quiz and attempt routes require authentication. Include the JWT token in cookies (automatically handled by browser) or pass it in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Database Models

### User
- name (String)
- email (String, required, unique)
- password (String, required, hashed)

### Quiz
- title (String)
- description (String)
- questions (Array of objects with text and options)
- isPublic (Boolean)
- accessPin (String, for private quizzes)
- createdBy (ObjectId, ref to User)

### Attempt
- quiz (ObjectId, ref to Quiz)
- student (ObjectId, ref to User)
- answers (Array of answer objects)
- score (Number)
- timestamps (createdAt, updatedAt)