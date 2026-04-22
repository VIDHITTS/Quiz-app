import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import socketService from "../services/socketService";
import { Trophy, Clock } from "lucide-react";
import "./LiveQuizTake.css";

function LiveQuizTake({ user }) {
  const navigate = useNavigate();
  const { roomCode } = useParams();
  const location = useLocation();

  const [question, setQuestion] = useState(location.state?.question || null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(
    location.state?.currentQuestionIndex || 0
  );
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [scoreboard, setScoreboard] = useState([]);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [timeLimit, setTimeLimit] = useState(location.state?.timeLimit || 15);
  const [startedAt, setStartedAt] = useState(location.state?.startedAt || null);
  const [timeRemaining, setTimeRemaining] = useState(null);

  // Countdown timer
  useEffect(() => {
    if (!startedAt || !timeLimit) return;

    const updateTimer = () => {
      const now = new Date();
      const start = new Date(startedAt);
      const elapsed = Math.floor((now - start) / 1000);
      const total = timeLimit * 60;
      const remaining = Math.max(0, total - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        toast.error("Time's up!");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [startedAt, timeLimit]);

  useEffect(() => {
    if (!user) {
      toast.error("Please login to participate");
      navigate("/login");
      return;
    }

    if (!question) {
      toast.error("Invalid quiz session");
      navigate("/join-live-quiz");
      return;
    }

    // Socket listeners for real-time quiz events
    socketService.onNextQuestion((data) => {
      setQuestion(data.question);
      setCurrentQuestionIndex(data.currentQuestionIndex);
      setSelectedOption(null);
      setHasAnswered(false);
      setShowScoreboard(false);
    });

    socketService.onAnswerSubmitted((data) => {
      setHasAnswered(true);
      setScore(data.score);
      toast.success(data.isCorrect ? "Correct! 🎉" : "Incorrect 😔");
    });

    socketService.onScoreboardUpdate((data) => {
      setScoreboard(data.scoreboard);
    });

    socketService.onParticipantFinished((data) => {
      setIsFinished(true);
      setShowScoreboard(true);
      toast.success(data.message);
    });

    socketService.onQuizCompleted((data) => {
      navigate(`/live-quiz-results/${roomCode}`, {
        state: { scoreboard: data.scoreboard },
      });
    });

    socketService.onHostDisconnected(() => {
      toast.error("Host has disconnected. Quiz ended.");
      setTimeout(() => navigate("/"), 2000);
    });

    socketService.onError((data) => {
      toast.error(data.message);
    });

    return () => {
      socketService.off("next-question");
      socketService.off("answer-submitted");
      socketService.off("scoreboard-update");
      socketService.off("participant-finished");
      socketService.off("quiz-completed");
    };
  }, []);

  const handleOptionSelect = (index) => {
    if (!hasAnswered) {
      setSelectedOption(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) {
      toast.error("Please select an answer");
      return;
    }

    socketService.submitAnswer(roomCode, currentQuestionIndex, selectedOption);
  };

  if (!question) {
    return (
      <div className="live-quiz-take-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading question...</p>
        </div>
      </div>
    );
  }

  // Finished state – waiting for host to end quiz
  if (isFinished) {
    return (
      <div className="live-quiz-take-container">
        <div className="live-quiz-take-card">
          <div className="finished-state">
            <div className="trophy-animation">
              <Trophy size={80} className="trophy-icon" />
            </div>
            <h2>🎉 Quiz Completed! 🎉</h2>
            <p className="final-score">Your Score: {score} points</p>
            <p className="waiting-message">
              Waiting for the host to end the quiz...
            </p>

            {scoreboard.length > 0 && (
              <div className="live-scoreboard">
                <h3>
                  <Trophy size={20} />
                  Current Standings
                </h3>
                <div className="scoreboard-list">
                  {scoreboard.map((participant, index) => (
                    <div
                      key={index}
                      className={`scoreboard-item ${
                        participant.name === user?.name ? "current-user" : ""
                      }`}
                    >
                      <span className="rank">
                        {index === 0 && "🥇"}
                        {index === 1 && "🥈"}
                        {index === 2 && "🥉"}
                        {index > 2 && `#${index + 1}`}
                      </span>
                      <span className="name">{participant.name}</span>
                      <div className="score-info">
                        <span className="answered-count">
                          {participant.answeredCount} answered
                        </span>
                        <span className="points">{participant.score} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-quiz-take-container">
      <div className="live-quiz-take-card">
        <div className="quiz-header">
          <div className="header-top">
            <div className="question-progress">
              Question {question.questionNumber} of {question.totalQuestions}
            </div>
            {timeRemaining !== null && (
              <div
                className={`timer-display ${
                  timeRemaining < 60 ? "warning" : ""
                }`}
              >
                <Clock size={20} />
                <span>
                  {Math.floor(timeRemaining / 60)}:
                  {String(timeRemaining % 60).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
          <div className="score-display">
            <Trophy size={20} />
            <span>Score: {score}</span>
          </div>
        </div>

        <div className="question-section">
          <h2 className="question-text">{question.text}</h2>
        </div>

        <div className="options-grid">
          {question.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${
                selectedOption === index ? "selected" : ""
              } ${hasAnswered ? "disabled" : ""}`}
              onClick={() => handleOptionSelect(index)}
              disabled={hasAnswered}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              <span className="option-text">{option.text}</span>
            </button>
          ))}
        </div>

        {!hasAnswered ? (
          <button
            className="submit-answer-button"
            onClick={handleSubmitAnswer}
            disabled={selectedOption === null}
          >
            Submit Answer
          </button>
        ) : (
          <div className="waiting-next">
            <div className="pulse-loader">
              <div className="pulse"></div>
              <div className="pulse"></div>
              <div className="pulse"></div>
            </div>
            <p>Waiting for next question...</p>
          </div>
        )}

        {showScoreboard && scoreboard.length > 0 && (
          <div className="live-scoreboard">
            <h3>Current Standings</h3>
            <div className="scoreboard-list">
              {scoreboard.slice(0, 5).map((participant, index) => (
                <div
                  key={index}
                  className={`scoreboard-item ${
                    participant.name === user.name ? "current-user" : ""
                  }`}
                >
                  <span className="rank">#{index + 1}</span>
                  <span className="name">{participant.name}</span>
                  <span className="points">{participant.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LiveQuizTake;
