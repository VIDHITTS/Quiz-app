import { io } from "socket.io-client";
import config from "../config";

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(config.API_BASE, {
        withCredentials: true,
        transports: ["websocket", "polling"],
      });

      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket.id);
      });

      this.socket.on("disconnect", () => {
        console.log("Socket disconnected");
      });

      this.socket.on("error", (data) => {
        console.error("Socket error:", data.message);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  // Host methods
  hostJoinRoom(roomCode, userId, userName) {
    if (this.socket) {
      this.socket.emit("host-join-room", { roomCode, userId, userName });
    }
  }

  startQuiz(roomCode) {
    if (this.socket) {
      this.socket.emit("start-quiz", { roomCode });
    }
  }

  nextQuestion(roomCode) {
    if (this.socket) {
      this.socket.emit("next-question", { roomCode });
    }
  }

  endQuiz(roomCode) {
    if (this.socket) {
      this.socket.emit("end-quiz", { roomCode });
    }
  }

  // Participant methods
  participantJoinRoom(roomCode, userId, userName) {
    if (this.socket) {
      this.socket.emit("participant-join-room", { roomCode, userId, userName });
    }
  }

  submitAnswer(roomCode, questionIndex, selectedOption) {
    if (this.socket) {
      this.socket.emit("submit-answer", {
        roomCode,
        questionIndex,
        selectedOption,
      });
    }
  }

  // Event listeners
  onHostJoined(callback) {
    if (this.socket) {
      this.socket.on("host-joined", callback);
    }
  }

  onParticipantJoined(callback) {
    if (this.socket) {
      this.socket.on("participant-joined", callback);
    }
  }

  onQuizStarted(callback) {
    if (this.socket) {
      this.socket.on("quiz-started", callback);
    }
  }

  onNextQuestion(callback) {
    if (this.socket) {
      this.socket.on("next-question", callback);
    }
  }

  onAnswerSubmitted(callback) {
    if (this.socket) {
      this.socket.on("answer-submitted", callback);
    }
  }

  onScoreboardUpdate(callback) {
    if (this.socket) {
      this.socket.on("scoreboard-update", callback);
    }
  }

  onParticipantFinished(callback) {
    if (this.socket) {
      this.socket.on("participant-finished", callback);
    }
  }

  onQuizCompleted(callback) {
    if (this.socket) {
      this.socket.on("quiz-completed", callback);
    }
  }

  onHostDisconnected(callback) {
    if (this.socket) {
      this.socket.on("host-disconnected", callback);
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on("error", callback);
    }
  }

  // Remove listeners
  off(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

const socketService = new SocketService();
export default socketService;
