import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import socketService from "../services/socketService";
import config from "../config";
import { Users, LogIn } from "lucide-react";
import "./JoinLiveQuiz.css";

const API_BASE = config.API_BASE;

function JoinLiveQuiz({ user }) {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [joinedRoomCode, setJoinedRoomCode] = useState("");

  useEffect(() => {
    if (!user) {
      toast.error("Please login to join a live quiz");
      navigate("/login");
      return;
    }

    // Setup socket listeners
    socketService.connect();

    socketService.onParticipantJoined((data) => {
      setParticipants(data.participants || []);
      if (data.newParticipant.userId !== user.id) {
        toast.success(`${data.newParticipant.userName} joined!`);
      }
    });

    socketService.onQuizStarted((data) => {
      navigate(`/live-quiz-take/${joinedRoomCode}`, {
        state: {
          question: data.question,
          currentQuestionIndex: data.currentQuestionIndex,
          timeLimit: data.timeLimit,
          startedAt: data.startedAt,
        },
      });
    });

    socketService.onHostDisconnected(() => {
      toast.error("Host has disconnected. Returning to home...");
      setTimeout(() => navigate("/"), 2000);
    });

    socketService.onError((data) => {
      toast.error(data.message);
      setIsJoining(false);
      setIsWaiting(false);
    });

    return () => {
      socketService.off("participant-joined");
      socketService.off("quiz-started");
      socketService.off("host-disconnected");
      socketService.off("error");
    };
  }, [joinedRoomCode]);

  const handleJoinRoom = async (e) => {
    e.preventDefault();

    if (!roomCode.trim()) {
      toast.error("Please enter a room code");
      return;
    }

    const code = roomCode.trim().toUpperCase();
    setIsJoining(true);

    try {
      // Verify the room exists and is joinable via REST
      const response = await fetch(`${API_BASE}/live-quizzes/${code}`, {
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        toast.error("Room not found");
        setIsJoining(false);
        return;
      }

      if (data.liveQuiz.status !== "waiting") {
        toast.error("This quiz has already started or completed");
        setIsJoining(false);
        return;
      }

      // Join the room via socket
      socketService.participantJoinRoom(code, user.id, user.name);

      setJoinedRoomCode(code);
      setParticipants(data.liveQuiz.participants || []);
      setIsWaiting(true);
      setIsJoining(false);
      toast.success("Joined the room! Waiting for host to start...");
    } catch (error) {
      console.error("Error joining room:", error);
      toast.error("Failed to join room");
      setIsJoining(false);
    }
  };

  if (isWaiting) {
    return (
      <div className="join-live-quiz-container">
        <div className="join-live-quiz-card">
          <div className="waiting-header">
            <Users size={48} className="waiting-icon" />
            <h1>Waiting Room</h1>
            <p className="room-code-display">Room: {joinedRoomCode}</p>
          </div>

          <div className="waiting-message">
            <div className="pulse-loader">
              <div className="pulse"></div>
              <div className="pulse"></div>
              <div className="pulse"></div>
            </div>
            <p>Waiting for host to start the quiz...</p>
          </div>

          <div className="participants-section">
            <h2>Participants ({participants.length})</h2>
            <div className="participants-grid">
              {participants.map((participant, index) => (
                <div key={index} className="participant-card">
                  <div className="participant-avatar">
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="participant-name">{participant.name}</span>
                  {participant.userId === user.id && (
                    <span className="you-badge">You</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="join-live-quiz-container">
      <div className="join-live-quiz-card">
        <div className="join-header">
          <LogIn size={48} className="join-icon" />
          <h1>Join Live Quiz</h1>
          <p>Enter the room code shared by your host</p>
        </div>

        <form onSubmit={handleJoinRoom} className="join-form">
          <div className="form-group">
            <label htmlFor="roomCode">Room Code</label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="room-code-input"
              disabled={isJoining}
            />
          </div>

          <button
            type="submit"
            className="join-button"
            disabled={isJoining || !roomCode.trim()}
          >
            {isJoining ? (
              <>
                <div className="button-spinner"></div>
                Joining...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Join Room
              </>
            )}
          </button>
        </form>

        <div className="join-hint">
          <p>Don't have a code? Ask your quiz host to share it with you.</p>
        </div>
      </div>
    </div>
  );
}

export default JoinLiveQuiz;
