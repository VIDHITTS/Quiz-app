import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import socketService from "../services/socketService";
import { ArrowRight, Users, Trophy } from "lucide-react";
import "./LiveQuizHost.css";

function LiveQuizHost({ user }) {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const location = useLocation();
  const { liveQuiz, quiz, initialQuestion, initialQuestionIndex } =
    location.state || {};

  const [scoreboard, setScoreboard] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [quizInfo, setQuizInfo] = useState({
    totalQuestions: quiz?.questions?.length || 0,
    totalParticipants: 0,
  });

  useEffect(() => {
    if (!liveQuiz || !quiz) {
      toast.error("Invalid session");
      navigate("/dashboard");
      return;
    }

    // Host is already connected from LiveQuizCreate – just attach listeners
    socketService.onScoreboardUpdate((data) => {
      setScoreboard(data.scoreboard);
      setQuizInfo((prev) => ({
        ...prev,
        totalParticipants: data.scoreboard.length,
      }));
    });

    socketService.onQuizCompleted((data) => {
      navigate(`/live-quiz-results/${roomCode}`, {
        state: { scoreboard: data.scoreboard, isHost: true },
      });
    });

    socketService.onError((data) => {
      toast.error(data.message);
    });

    return () => {
      socketService.off("scoreboard-update");
      socketService.off("quiz-completed");
    };
  }, []);

  const handleEndQuiz = () => {
    if (confirm("Are you sure you want to end the quiz and show results?")) {
      socketService.endQuiz(roomCode);
    }
  };

  return (
    <div className="live-quiz-host-container">
      <div className="live-quiz-host-card">
        <div className="host-header">
          <div className="question-info">
            <h2>Live Quiz in Progress</h2>
            <p className="room-code">Room: {roomCode}</p>
          </div>
          <div className="participants-count">
            <Users size={24} />
            <span>{quizInfo.totalParticipants} Players</span>
          </div>
        </div>

        <div className="quiz-stats">
          <div className="stat-card">
            <h3>Total Questions</h3>
            <p className="stat-value">{quizInfo.totalQuestions}</p>
          </div>
          <div className="stat-card">
            <h3>Active Players</h3>
            <p className="stat-value">{quizInfo.totalParticipants}</p>
          </div>
        </div>

        {scoreboard.length > 0 ? (
          <div className="host-scoreboard">
            <h3>
              <Trophy size={24} />
              Live Leaderboard
            </h3>

            {/* Top 3 Podium */}
            {scoreboard.length >= 3 && (
              <div className="podium-container">
                {/* 2nd Place */}
                <div className="podium-item second">
                  <div className="podium-rank">🥈</div>
                  <div className="podium-player">
                    <div className="player-name">{scoreboard[1].name}</div>
                    <div className="player-score">
                      {scoreboard[1].score} pts
                    </div>
                    <div className="player-progress">
                      {scoreboard[1].answeredCount}/{quizInfo.totalQuestions}
                    </div>
                  </div>
                  <div className="podium-bar second-bar"></div>
                </div>

                {/* 1st Place */}
                <div className="podium-item first">
                  <div className="podium-rank">🥇</div>
                  <div className="podium-player">
                    <div className="player-name">{scoreboard[0].name}</div>
                    <div className="player-score">
                      {scoreboard[0].score} pts
                    </div>
                    <div className="player-progress">
                      {scoreboard[0].answeredCount}/{quizInfo.totalQuestions}
                    </div>
                  </div>
                  <div className="podium-bar first-bar"></div>
                </div>

                {/* 3rd Place */}
                <div className="podium-item third">
                  <div className="podium-rank">🥉</div>
                  <div className="podium-player">
                    <div className="player-name">{scoreboard[2].name}</div>
                    <div className="player-score">
                      {scoreboard[2].score} pts
                    </div>
                    <div className="player-progress">
                      {scoreboard[2].answeredCount}/{quizInfo.totalQuestions}
                    </div>
                  </div>
                  <div className="podium-bar third-bar"></div>
                </div>
              </div>
            )}

            {/* Rest of the players */}
            <div className="scoreboard-list">
              {scoreboard
                .slice(scoreboard.length >= 3 ? 3 : 0)
                .map((participant, index) => {
                  const actualRank =
                    (scoreboard.length >= 3 ? 3 : 0) + index + 1;
                  return (
                    <div key={index} className="scoreboard-item">
                      <span className="position">#{actualRank}</span>
                      <span className="player-name">{participant.name}</span>
                      <div className="player-stats">
                        <span className="player-answered">
                          {participant.answeredCount}/{quizInfo.totalQuestions}
                        </span>
                        <span className="player-score">
                          {participant.score} pts
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        ) : (
          <div className="empty-scoreboard">
            <Trophy size={48} className="empty-icon" />
            <p>Waiting for participants to start answering...</p>
          </div>
        )}

        <div className="host-actions">
          <button className="end-quiz-button" onClick={handleEndQuiz}>
            <Trophy size={20} />
            End Quiz & Show Results
          </button>
        </div>
      </div>
    </div>
  );
}

export default LiveQuizHost;
