import { Link } from "react-router-dom";
import "./Home.css";

function Home({ user }) {
  return (
    <div className="page-container">
      <div className="hero">
        <h1>Welcome to Quiz App</h1>
        <p>Create, share, and take quizzes with ease!</p>

        {user ? (
          <div className="hero-actions">
            <Link to="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
            <Link to="/quizzes" className="btn btn-secondary">
              Browse Quizzes
            </Link>
          </div>
        ) : (
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/quizzes" className="btn btn-secondary">
              Browse Quizzes
            </Link>
          </div>
        )}
      </div>

      <div className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature">
            <h3>Create Quizzes</h3>
            <p>Build custom quizzes with multiple choice questions</p>
          </div>
          <div className="feature">
            <h3>Take Quizzes</h3>
            <p>Challenge yourself with quizzes from other users</p>
          </div>
          <div className="feature">
            <h3>Track Progress</h3>
            <p>Monitor your quiz performance and scores</p>
          </div>
          <div className="feature">
            <h3>Private Quizzes</h3>
            <p>Create private quizzes with PIN protection</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
