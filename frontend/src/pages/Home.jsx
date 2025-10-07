import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import config from "../config";
import "./Home.css";

const API_BASE = config.API_BASE;

function Home({ user }) {
  const [trendingQuizzes, setTrendingQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingQuizzes();
  }, []);

  const fetchTrendingQuizzes = async () => {
    try {
      const response = await fetch(`${API_BASE}/quizzes/trending?limit=6`);
      const data = await response.json();

      if (data.success) {
        setTrendingQuizzes(data.data);
      }
    } catch (error) {
      console.error("Error fetching trending quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

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

      {/* Trending Quizzes Section */}
      <div className="trending-section">
        <h2>🔥 Trending Public Quizzes</h2>
        {loading ? (
          <div className="loading-message">Loading trending quizzes...</div>
        ) : trendingQuizzes.length > 0 ? (
          <div className="trending-grid">
            {trendingQuizzes.map((quiz) => (
              <div key={quiz._id} className="trending-quiz-card">
                <h3>{quiz.title}</h3>
                <p className="quiz-description">
                  {quiz.description || "No description available"}
                </p>
                <div className="quiz-meta">
                  <span className="question-count">
                    {quiz.questions?.length || 0} questions
                  </span>
                  <span className="attempt-count">
                    {quiz.attemptCount || 0} attempts
                  </span>
                </div>
                <div className="quiz-creator">
                  By: {quiz.createdBy?.name || "Anonymous"}
                </div>
                <Link
                  to={`/quiz/${quiz._id}`}
                  className="btn btn-primary btn-small"
                >
                  Try Quiz
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-quizzes-message">
            <p>
              No trending quizzes available yet. Be the first to create one!
            </p>
            <Link to="/create-quiz" className="btn btn-primary">
              Create Quiz
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
