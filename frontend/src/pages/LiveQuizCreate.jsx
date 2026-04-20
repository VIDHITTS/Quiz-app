import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import config from "../config";
import socketService from "../services/socketService";
import { Copy, Users, Play, Crown } from "lucide-react";
import "./LiveQuizCreate.css";

const API_BASE = config.API_BASE;

function LiveQuizCreate({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { quiz } = location.state || {};

  const [liveQuiz, setLiveQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [timeLimit, setTimeLimit] = useState(15);
  const [showSettings, setShowSettings] = useState(true);

  useEffect(() => {
    if (!quiz) {
      toast.error("No quiz selected");
      navigate("/dashboard");
      return;
    }

    if (quiz.timeLimit) {
      setTimeLimit(quiz.timeLimit);
    }

    return () => {
      // Socket persists when navigating to host page
    };
  }, []);

  const createLiveQuiz = async () => {
    setLoading(true);
    setShowSettings(false);
    try {
      const response = await fetch(`${API_BASE}/live-quizzes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          quizId: quiz._id,
          randomizeQuestions,
          timeLimit,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const newLiveQuiz = data.liveQuiz;
        setLiveQuiz(newLiveQuiz);

        // Connect to socket and join room as host
        socketService.connect();
        socketService.hostJoinRoom(newLiveQuiz.roomCode, user.id, user.name);

        // Listen for events
        socketService.onHostJoined((data) => {
          setParticipants(data.participants || []);
        });

        socketService.onParticipantJoined((data) => {
          setParticipants(data.participants || []);
          toast.success(`${data.newParticipant.userName} joined the room!`);
        });

        socketService.onQuizStarted((data) => {
          navigate(`/live-quiz-host/${newLiveQuiz.roomCode}`, {
            state: {
              liveQuiz: newLiveQuiz,
              quiz,
              initialQuestion: data.question,
              initialQuestionIndex: data.currentQuestionIndex,
            },
          });
        });

        socketService.onError((data) => {
          toast.error(data.message);
        });

        toast.success("Live quiz room created!");
      } else {
        toast.error(data.error || "Failed to create live quiz");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error creating live quiz:", error);
      toast.error("Failed to create live quiz");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const copyRoomCode = () => {
    if (liveQuiz?.roomCode) {
      navigator.clipboard.writeText(liveQuiz.roomCode);
      toast.success("Room code copied to clipboard!");
    }
  };

  const handleStartQuiz = () => {
    if (participants.length === 0) {
      toast.error("Wait for at least one participant to join");
      return;
    }

    socketService.startQuiz(liveQuiz.roomCode);
  };

  if (loading) {
    return (
      <div className="live-quiz-create-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Creating live quiz room...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="live-quiz-create-container">
        <div className="loading-state">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show settings form before creating the quiz
  if (showSettings && !liveQuiz) {
    return (
      <div className="live-quiz-create-container">
        <div className="live-quiz-create-card">
          <div className="quiz-header">
            <Crown className="crown-icon" size={32} />
            <h1>{quiz.title}</h1>
            <p className="quiz-subtitle">Configure Live Quiz</p>
          </div>

          <div className="settings-section">
            <div className="setting-item">
              <label htmlFor="timeLimit" className="setting-label">
                ⏱️ Time Limit (minutes)
              </label>
              <input
                type="number"
                id="timeLimit"
                min="1"
                max="180"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value) || 15)}
                className="time-input"
              />
              <p className="setting-hint">
                Total time for the entire quiz (1-180 minutes)
              </p>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                />
                <span>🔀 Randomize question order</span>
              </label>
            </div>
          </div>

          <div className="action-section">
            <button onClick={createLiveQuiz} className="start-quiz-button">
              <Play size={20} />
              Create Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!liveQuiz) {
    return null;
  }

  return (
    <div className="live-quiz-create-container">
      <div className="live-quiz-create-card">
        <div className="quiz-header">
          <Crown className="crown-icon" size={32} />
          <h1>{quiz.title}</h1>
          <p className="quiz-subtitle">Waiting Room</p>
        </div>

        <div className="room-code-section">
          <div className="room-code-label">Room Code</div>
          <div className="room-code-display">
            <span className="code">{liveQuiz.roomCode}</span>
            <button
              onClick={copyRoomCode}
              className="copy-button"
              title="Copy code"
            >
              <Copy size={20} />
            </button>
          </div>
          <p className="room-code-hint">
            Share this code with participants to join
          </p>
        </div>

        <div className="participants-section">
          <div className="participants-header">
            <Users size={24} />
            <h2>Participants ({participants.length})</h2>
          </div>

          {participants.length === 0 ? (
            <div className="empty-state">
              <Users size={48} className="empty-icon" />
              <p>Waiting for participants to join...</p>
              <p className="empty-hint">They need to enter the room code</p>
            </div>
          ) : (
            <div className="participants-list">
              {participants.map((participant, index) => (
                <div key={index} className="participant-item">
                  <div className="participant-avatar">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="participant-name">{participant.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="action-section">
          <button
            onClick={handleStartQuiz}
            className="start-quiz-button"
            disabled={participants.length === 0}
          >
            <Play size={20} />
            Start Quiz
          </button>
          {participants.length === 0 && (
            <p className="start-hint">Need at least 1 participant to start</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveQuizCreate;
