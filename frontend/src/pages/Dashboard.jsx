import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const API_BASE = 'http://localhost:3451';

function Dashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/dashboard`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.dashboard);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user.name}!</h1>
        <Link to="/create-quiz" className="btn btn-primary">
          Create New Quiz
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Quizzes Created</h3>
          <div className="stat-number">{dashboardData?.stats?.totalQuizzes || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Quizzes Taken</h3>
          <div className="stat-number">{dashboardData?.stats?.totalAttempts || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Average Score</h3>
          <div className="stat-number">{dashboardData?.stats?.averageScore || 0}%</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Recent Quizzes</h2>
          {dashboardData?.recentQuizzes?.length > 0 ? (
            <div className="quiz-list">
              {dashboardData.recentQuizzes.map(quiz => (
                <div key={quiz._id} className="quiz-card">
                  <h3>{quiz.title}</h3>
                  <p>{quiz.description}</p>
                  <div className="quiz-actions">
                    <Link to={`/edit-quiz/${quiz._id}`} className="btn btn-secondary">
                      Edit
                    </Link>
                    <Link to={`/quiz/${quiz._id}`} className="btn btn-outline">
                      Preview
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>You haven't created any quizzes yet.</p>
              <Link to="/create-quiz" className="btn btn-primary">
                Create Your First Quiz
              </Link>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Recent Attempts</h2>
          {dashboardData?.recentAttempts?.length > 0 ? (
            <div className="attempts-list">
              {dashboardData.recentAttempts.map(attempt => (
                <div key={attempt._id} className="attempt-card">
                  <h4>{attempt.quiz.title}</h4>
                  <div className="attempt-score">
                    Score: {attempt.score}/{attempt.totalQuestions} ({attempt.percentage}%)
                  </div>
                  <div className="attempt-date">
                    {new Date(attempt.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>You haven't taken any quizzes yet.</p>
              <Link to="/quizzes" className="btn btn-primary">
                Browse Quizzes
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;