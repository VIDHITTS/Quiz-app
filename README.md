# Quiz Application

A full-stack quiz application built with React frontend and Node.js backend, featuring user authentication, quiz management, and real-time quiz taking.

## Features

### Authentication

- User registration and login
- JWT-based authentication with secure cookies
- Password hashing with bcrypt
- Protected routes and API endpoints

### Quiz Management

- Create custom quizzes with multiple choice questions
- Edit existing quizzes (only by quiz creator)
- Public and private quizzes (with PIN protection)
- Delete quizzes
- View quiz statistics

### Quiz Taking

- Take quizzes with real-time progress tracking
- Multiple choice questions with radio button selection
- Submit answers and get instant results
- Score calculation and feedback

### User Features

- User dashboard with quiz statistics
- Profile management with avatar display
- View quiz history and attempts
- Edit profile information

## Tech Stack

### Backend

- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing
- **CORS** for cross-origin requests
- **cookie-parser** for cookie handling

### Frontend

- **React** with Vite build tool
- **React Router DOM** for navigation
- **Native Fetch API** for HTTP requests
- **CSS3** with responsive design
- **Component-based architecture**

## Project Structure

```
Quiz-app/
├── backend/
│   ├── index.js                 # Main server file
│   ├── package.json             # Backend dependencies
│   ├── config/
│   │   └── db.js               # Database configuration
│   ├── controllers/
│   │   ├── authcontroller.js   # Authentication logic
│   │   ├── quizcontrol.js      # Quiz CRUD operations
│   │   ├── attemptcontroller.js # Quiz attempt handling
│   │   └── usercontroller.js   # User management
│   ├── models/
│   │   ├── user.js             # User schema
│   │   ├── quiz.js             # Quiz schema
│   │   └── attempt.js          # Attempt schema
│   └── routes/
│       ├── quizroutes.js       # Quiz API routes
│       ├── attemptroutes.js    # Attempt API routes
│       └── userroutes.js       # User API routes
└── frontend/
    ├── package.json            # Frontend dependencies
    ├── vite.config.js          # Vite configuration
    ├── index.html              # HTML template
    ├── src/
    │   ├── App.jsx             # Main React component
    │   ├── App.css             # Global styles
    │   ├── main.jsx            # React entry point
    │   ├── components/
    │   │   └── Navbar.jsx      # Navigation component
    │   └── pages/
    │       ├── Home.jsx        # Landing page
    │       ├── Login.jsx       # Login form
    │       ├── Register.jsx    # Registration form
    │       ├── Dashboard.jsx   # User dashboard
    │       ├── QuizList.jsx    # Browse quizzes
    │       ├── QuizCreate.jsx  # Create new quiz
    │       ├── QuizEdit.jsx    # Edit existing quiz
    │       ├── QuizTake.jsx    # Take quiz interface
    │       └── Profile.jsx     # User profile
    └── public/
        └── vite.svg           # App icon
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/quizapp
JWT_SECRET=your_jwt_secret_key_here
PORT=3451
```

4. Start the backend server:

```bash
npm start
```

The backend will run on `http://localhost:3451`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Database Setup

Make sure MongoDB is running on your system. The application will automatically create the `quizapp` database and required collections.

## API Endpoints

### Authentication

- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout

### Quizzes

- `GET /quizzes` - Get all public quizzes
- `GET /quizzes/:id` - Get specific quiz
- `POST /quizzes` - Create new quiz (authenticated)
- `PUT /quizzes/:id` - Update quiz (authenticated, owner only)
- `DELETE /quizzes/:id` - Delete quiz (authenticated, owner only)
- `POST /quizzes/:id/access` - Access private quiz with PIN

### Quiz Attempts

- `POST /attempts/submit` - Submit quiz attempt
- `GET /attempts/user/:userId` - Get user's attempts
- `GET /attempts/quiz/:quizId` - Get quiz attempts (owner only)

### Users

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

## Usage

### Creating a Quiz

1. Register/Login to your account
2. Navigate to "Create Quiz" from the dashboard
3. Fill in quiz details (title, description)
4. Add questions with multiple choice options
5. Mark the correct answer for each question
6. Optionally make the quiz private with a PIN
7. Submit to create the quiz

### Taking a Quiz

1. Browse available quizzes from "Browse Quizzes"
2. Click "Take Quiz" on any quiz
3. If private, enter the required PIN
4. Answer all questions (progress bar shows completion)
5. Submit to see your results

### Managing Quizzes

1. View your created quizzes from the dashboard
2. Edit or delete quizzes you've created
3. View attempt statistics for your quizzes
4. Monitor quiz performance and user engagement

## Features in Detail

### Authentication System

- Secure JWT tokens stored in httpOnly cookies
- Password hashing using bcrypt with salt rounds
- Automatic token refresh and session management
- Protected routes for authenticated users only

### Quiz Creation

- Dynamic question addition/removal
- Multiple choice options (4 per question)
- Radio button selection for correct answers
- Form validation for required fields
- Private quiz PIN protection

### Quiz Taking Interface

- Real-time progress tracking
- Question navigation
- Answer persistence during session
- Submit button enabled only when all questions answered
- Instant score calculation and feedback

### Responsive Design

- Mobile-first CSS approach
- Flexible grid layouts
- Touch-friendly interface elements
- Cross-device compatibility

## Development Notes

### Port Configuration

- Backend runs on port 3451 (changed from 5000 due to macOS AirPlay conflict)
- Frontend runs on port 5173 (Vite default)
- MongoDB runs on default port 27017

### Error Handling

- Comprehensive error messages for API failures
- Form validation with user-friendly feedback
- Network error handling with retry mechanisms
- MongoDB connection error handling

### Security Features

- CORS configuration for cross-origin requests
- JWT secret key for token signing
- Password hashing before database storage
- httpOnly cookies to prevent XSS attacks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or contributions, please open an issue in the repository or contact the development team.

---
