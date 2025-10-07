import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import config from "../config";
import "./QuizList.css";

const API_BASE = config.API_BASE;

function QuizList({ user }) {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${API_BASE}/quizzes/public`);

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes || []);
      } else {
        setError("Failed to load quizzes");
      }
    } catch (error) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(
    (quiz) =>
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading quizzes...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Browse Quizzes</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {filteredQuizzes.length === 0 && !loading ? (
        <div className="empty-state">
          <h2>No quizzes found</h2>
          <p>
            {searchTerm
              ? `No quizzes match "${searchTerm}"`
              : "No public quizzes available yet."}
          </p>
          {user && (
            <Link to="/create-quiz" className="btn btn-primary">
              Create the First Quiz
            </Link>
          )}
        </div>
      ) : (
        <div className="quizzes-grid">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-card-header">
                <h3>{quiz.title}</h3>
                <div className="quiz-meta-top">
                  <span className="quiz-questions-count">
                    {quiz.questions?.length || 0} questions
                  </span>
                  {!quiz.isPublic && (
                    <span className="privacy-badge private">🔒 Private</span>
                  )}
                  {quiz.isPublic && (
                    <span className="privacy-badge public">🌍 Public</span>
                  )}
                </div>
              </div>

              <p className="quiz-description">
                {quiz.description || "No description available"}
              </p>

              <div className="quiz-meta">
                <span className="quiz-author">
                  By: {quiz.createdBy?.name || "Unknown"}
                </span>
                <span className="quiz-date">
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="quiz-actions">
                {user ? (
                  quiz.isPublic ? (
                    <Link to={`/quiz/${quiz._id}`} className="btn btn-primary">
                      Take Quiz
                    </Link>
                  ) : (
                    <Link to={`/quiz/${quiz._id}`} className="btn btn-warning">
                      🔒 Access with PIN
                    </Link>
                  )
                ) : (
                  <Link to="/login" className="btn btn-primary">
                    Login to Take Quiz
                  </Link>
                )}

                {user && quiz.createdBy?._id === user.id && (
                  <Link
                    to={`/edit-quiz/${quiz._id}`}
                    className="btn btn-secondary"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizList;
