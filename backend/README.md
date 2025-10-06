# Quiz App Backend

A comprehensive RESTful API for a quiz application built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Register, login, logout with JWT tokens
- **Quiz Management**: Create, read, update, delete quizzes
- **Quiz Attempts**: Submit answers and track scores
- **User Profiles**: View and update user information
- **Access Control**: Public and private quizzes with PIN protection
- **Dashboard**: User statistics and recent activity

## API Endpoints

### Authentication

- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user

### Quizzes

- `GET /quizzes/public` - Get all public quizzes
- `POST /quizzes/:id/access` - Access quiz (with PIN for private quizzes)
- `POST /quizzes` - Create a new quiz (protected)
- `GET /quizzes/my-quizzes` - Get user's quizzes (protected)
- `GET /quizzes/:id` - Get quiz by ID (protected)
- `PUT /quizzes/:id` - Update quiz (protected)
- `DELETE /quizzes/:id` - Delete quiz (protected)

### Attempts

- `POST /attempts/submit` - Submit quiz attempt (protected)
- `GET /attempts/my-attempts` - Get user's attempts (protected)
- `GET /attempts/:id` - Get attempt details (protected)
- `GET /attempts/quiz/:quizId` - Get attempts for a quiz (protected)

### Users

- `GET /users/profile` - Get user profile (protected)
- `PUT /users/profile` - Update user profile (protected)
- `GET /users/dashboard` - Get dashboard data (protected)

### Test

- `GET /api/test` - Test endpoint to verify server is running
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
