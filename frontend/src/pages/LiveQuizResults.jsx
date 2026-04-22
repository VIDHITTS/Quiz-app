import { useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Trophy, Medal, Award, Home } from "lucide-react";
import socketService from "../services/socketService";
import "./LiveQuizResults.css";

function LiveQuizResults({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomCode } = useParams();
  const { scoreboard, isHost } = location.state || {};

  useEffect(() => {
    if (!scoreboard) {
      navigate("/");
      return;
    }

    // Disconnect socket when leaving results
    return () => {
      socketService.disconnect();
    };
  }, []);

  const getPositionIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy size={32} className="position-icon gold" />;
      case 1:
        return <Medal size={32} className="position-icon silver" />;
      case 2:
        return <Award size={32} className="position-icon bronze" />;
      default:
        return <span className="position-number">#{index + 1}</span>;
    }
  };

  const getPositionClass = (index) => {
    switch (index) {
      case 0:
        return "first-place";
      case 1:
        return "second-place";
      case 2:
        return "third-place";
      default:
        return "";
    }
  };

  const userRank = scoreboard.findIndex(
    (participant) => participant.name === user?.name
  );

  return (
    <div className="live-quiz-results-container">
      <div className="live-quiz-results-card">
        <div className="results-header">
          <Trophy size={64} className="main-trophy" />
          <h1>Quiz Complete!</h1>
          <p className="room-info">Room: {roomCode}</p>
        </div>

        {!isHost && userRank !== -1 && (
          <div className="personal-result">
            <h2>Your Result</h2>
            <div className="personal-stats">
              <div className="stat-item">
                <span className="stat-label">Rank</span>
                <span className="stat-value">#{userRank + 1}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Score</span>
                <span className="stat-value">{scoreboard[userRank].score}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total</span>
                <span className="stat-value">
                  {scoreboard[userRank].totalQuestions}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="final-scoreboard">
          <h2>Final Leaderboard</h2>
          <div className="scoreboard-list">
            {scoreboard.map((participant, index) => (
              <div
                key={index}
                className={`scoreboard-result-item ${getPositionClass(index)} ${
                  participant.name === user?.name ? "current-user" : ""
                }`}
              >
                <div className="position-indicator">
                  {getPositionIcon(index)}
                </div>
                <div className="participant-info">
                  <span className="participant-name">
                    {participant.name}
                    {participant.name === user?.name && (
                      <span className="you-badge">You</span>
                    )}
                  </span>
                  <span className="participant-details">
                    {participant.score} / {participant.totalQuestions} correct
                  </span>
                </div>
                <div className="score-badge">{participant.score}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="results-actions">
          <button className="home-button" onClick={() => navigate("/")}>
            <Home size={20} />
            Back to Home
          </button>
          {isHost && (
            <button
              className="dashboard-button"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveQuizResults;
