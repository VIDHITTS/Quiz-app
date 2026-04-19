const LiveQuiz = require("../models/liveQuiz");
const Quiz = require("../models/quiz");

module.exports = (io) => {
  // In-memory room state for fast lookups
  const rooms = new Map();
  const quizTimers = new Map();

  io.on("connection", (socket) => {
    // Host joins the room they created
    socket.on("host-join-room", async ({ roomCode, userId, userName }) => {
      try {
        const liveQuiz = await LiveQuiz.findOne({ roomCode }).populate(
          "quizId"
        );

        if (!liveQuiz) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        if (liveQuiz.createdBy.toString() !== userId) {
          socket.emit("error", { message: "Not authorized" });
          return;
        }

        socket.join(roomCode);
        socket.data.roomCode = roomCode;
        socket.data.isHost = true;
        socket.data.userId = userId;

        if (!rooms.has(roomCode)) {
          rooms.set(roomCode, {
            host: socket.id,
            participants: new Map(),
            currentQuestionIndex: liveQuiz.currentQuestionIndex,
          });
        }

        socket.emit("host-joined", {
          liveQuiz,
          participants: liveQuiz.participants,
        });
      } catch (error) {
        console.error("Error in host-join-room:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Participant joins room
    socket.on(
      "participant-join-room",
      async ({ roomCode, userId, userName }) => {
        try {
          const liveQuiz = await LiveQuiz.findOne({ roomCode });

          if (!liveQuiz) {
            socket.emit("error", { message: "Room not found" });
            return;
          }

          if (liveQuiz.status !== "waiting") {
            socket.emit("error", {
              message: "Quiz has already started or completed",
            });
            return;
          }

          // Check if user already joined
          const existingParticipant = liveQuiz.participants.find(
            (p) => p.userId && p.userId.toString() === userId
          );

          if (!existingParticipant) {
            liveQuiz.participants.push({
              userId,
              name: userName,
              score: 0,
              answers: [],
            });
            await liveQuiz.save();
          }

          socket.join(roomCode);
          socket.data.roomCode = roomCode;
          socket.data.isHost = false;
          socket.data.userId = userId;
          socket.data.userName = userName;

          // Track in memory for fast access
          const room = rooms.get(roomCode);
          if (room) {
            room.participants.set(socket.id, { userId, userName, score: 0 });
          }

          // Broadcast updated participant list
          const updatedLiveQuiz = await LiveQuiz.findOne({
            roomCode,
          }).populate("quizId");

          io.to(roomCode).emit("participant-joined", {
            participants: updatedLiveQuiz.participants,
            newParticipant: { userId, userName },
          });
        } catch (error) {
          console.error("Error in participant-join-room:", error);
          socket.emit("error", { message: "Failed to join room" });
        }
      }
    );

    // Host starts the quiz
    socket.on("start-quiz", async ({ roomCode }) => {
      try {
        const liveQuiz = await LiveQuiz.findOne({ roomCode }).populate(
          "quizId"
        );

        if (!liveQuiz) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        const userId = socket.data.userId;
        const isCreator = userId && liveQuiz.createdBy.toString() === userId;

        if (!socket.data.isHost && !isCreator) {
          socket.emit("error", { message: "Only host can start quiz" });
          return;
        }

        liveQuiz.status = "in-progress";
        liveQuiz.startedAt = new Date();
        liveQuiz.currentQuestionIndex = 0;
        await liveQuiz.save();

        const room = rooms.get(roomCode);
        if (room) {
          room.currentQuestionIndex = 0;
        }

        // Send first question (strip correct answers)
        const quiz = liveQuiz.quizId;
        const questionIndex = liveQuiz.questionOrder[0];
        const question = quiz.questions[questionIndex];

        const questionData = {
          text: question.text,
          options: question.options.map((opt) => ({ text: opt.text })),
          questionNumber: 1,
          totalQuestions: quiz.questions.length,
        };

        io.to(roomCode).emit("quiz-started", {
          question: questionData,
          currentQuestionIndex: 0,
          timeLimit: liveQuiz.timeLimit,
          startedAt: liveQuiz.startedAt,
        });

        // Auto-end timer when time limit is reached
        const timeLimitMs = liveQuiz.timeLimit * 60 * 1000;
        const timer = setTimeout(async () => {
          try {
            const expiredQuiz = await LiveQuiz.findOne({ roomCode }).populate(
              "quizId"
            );
            if (expiredQuiz && expiredQuiz.status === "in-progress") {
              expiredQuiz.status = "completed";
              expiredQuiz.completedAt = new Date();
              await expiredQuiz.save();

              const finalScoreboard = expiredQuiz.participants
                .map((p) => ({
                  name: p.name,
                  score: p.score,
                  totalQuestions: expiredQuiz.quizId.questions.length,
                }))
                .sort((a, b) => b.score - a.score);

              io.to(roomCode).emit("quiz-completed", {
                scoreboard: finalScoreboard,
                roomCode,
                reason: "time-expired",
              });

              quizTimers.delete(roomCode);
            }
          } catch (error) {
            console.error("Error auto-ending quiz:", error);
          }
        }, timeLimitMs);

        quizTimers.set(roomCode, timer);
      } catch (error) {
        console.error("Error starting quiz:", error);
        socket.emit("error", { message: "Failed to start quiz" });
      }
    });

    // Participant submits an answer
    socket.on(
      "submit-answer",
      async ({ roomCode, questionIndex, selectedOption }) => {
        try {
          const liveQuiz = await LiveQuiz.findOne({ roomCode }).populate(
            "quizId"
          );

          if (!liveQuiz) {
            socket.emit("error", { message: "Room not found" });
            return;
          }

          const userId = socket.data.userId;
          const participant = liveQuiz.participants.find(
            (p) => p.userId && p.userId.toString() === userId
          );

          if (!participant) {
            socket.emit("error", { message: "Participant not found" });
            return;
          }

          // Prevent duplicate answers
          const alreadyAnswered = participant.answers.find(
            (a) => a.questionIndex === questionIndex
          );

          if (alreadyAnswered) {
            socket.emit("error", { message: "Already answered this question" });
            return;
          }

          // Grade the answer
          const quiz = liveQuiz.quizId;
          const actualQuestionIndex = liveQuiz.questionOrder[questionIndex];
          const question = quiz.questions[actualQuestionIndex];
          const isCorrect = question.options[selectedOption]?.correct === true;

          participant.answers.push({
            questionIndex,
            selectedOption,
            isCorrect,
            answeredAt: new Date(),
          });

          if (isCorrect) {
            participant.score += 1;
          }

          await liveQuiz.save();

          // Tell the participant their result
          socket.emit("answer-submitted", {
            isCorrect,
            score: participant.score,
          });

          // Broadcast updated scoreboard
          const scoreboard = liveQuiz.participants
            .map((p) => ({
              name: p.name,
              score: p.score,
              answeredCount: p.answers.length,
            }))
            .sort((a, b) => b.score - a.score);

          io.to(roomCode).emit("scoreboard-update", { scoreboard });

          // Auto-advance to next question for this participant
          const nextQuestionIndex = questionIndex + 1;

          if (nextQuestionIndex < quiz.questions.length) {
            const actualNextIndex = liveQuiz.questionOrder[nextQuestionIndex];
            const nextQuestion = quiz.questions[actualNextIndex];

            socket.emit("next-question", {
              question: {
                text: nextQuestion.text,
                options: nextQuestion.options.map((opt) => ({
                  text: opt.text,
                })),
                questionNumber: nextQuestionIndex + 1,
                totalQuestions: quiz.questions.length,
              },
              currentQuestionIndex: nextQuestionIndex,
            });
          } else {
            // Participant finished all questions
            socket.emit("participant-finished", {
              message:
                "You've completed all questions! Waiting for others...",
              score: participant.score,
              totalQuestions: quiz.questions.length,
            });
          }
        } catch (error) {
          console.error("Error submitting answer:", error);
          socket.emit("error", { message: "Failed to submit answer" });
        }
      }
    );

    // Host moves to next question (broadcast mode)
    socket.on("next-question", async ({ roomCode }) => {
      try {
        const liveQuiz = await LiveQuiz.findOne({ roomCode }).populate(
          "quizId"
        );

        if (!liveQuiz) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        const userId = socket.data.userId;
        const isCreator = userId && liveQuiz.createdBy.toString() === userId;

        if (!socket.data.isHost && !isCreator) {
          socket.emit("error", { message: "Only host can control questions" });
          return;
        }

        const nextIndex = liveQuiz.currentQuestionIndex + 1;
        const quiz = liveQuiz.quizId;

        if (nextIndex >= quiz.questions.length) {
          // All questions done – complete the quiz
          liveQuiz.status = "completed";
          liveQuiz.completedAt = new Date();
          await liveQuiz.save();

          const finalScoreboard = liveQuiz.participants
            .map((p) => ({
              name: p.name,
              score: p.score,
              totalQuestions: quiz.questions.length,
            }))
            .sort((a, b) => b.score - a.score);

          io.to(roomCode).emit("quiz-completed", {
            scoreboard: finalScoreboard,
            roomCode,
          });

          // Clear auto-end timer
          const timer = quizTimers.get(roomCode);
          if (timer) {
            clearTimeout(timer);
            quizTimers.delete(roomCode);
          }

          return;
        }

        liveQuiz.currentQuestionIndex = nextIndex;
        await liveQuiz.save();

        const room = rooms.get(roomCode);
        if (room) {
          room.currentQuestionIndex = nextIndex;
        }

        const questionIndex = liveQuiz.questionOrder[nextIndex];
        const question = quiz.questions[questionIndex];

        const questionData = {
          text: question.text,
          options: question.options.map((opt) => ({ text: opt.text })),
          questionNumber: nextIndex + 1,
          totalQuestions: quiz.questions.length,
        };

        io.to(roomCode).emit("next-question", {
          question: questionData,
          currentQuestionIndex: nextIndex,
        });
      } catch (error) {
        console.error("Error moving to next question:", error);
        socket.emit("error", { message: "Failed to move to next question" });
      }
    });

    // Host manually ends the quiz
    socket.on("end-quiz", async ({ roomCode }) => {
      try {
        const liveQuiz = await LiveQuiz.findOne({ roomCode }).populate(
          "quizId"
        );

        if (!liveQuiz) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        const userId = socket.data.userId;
        const isCreator = userId && liveQuiz.createdBy.toString() === userId;

        if (!socket.data.isHost && !isCreator) {
          socket.emit("error", { message: "Only host can end quiz" });
          return;
        }

        const quiz = liveQuiz.quizId;

        liveQuiz.status = "completed";
        liveQuiz.completedAt = new Date();
        await liveQuiz.save();

        const finalScoreboard = liveQuiz.participants
          .map((p) => ({
            name: p.name,
            score: p.score,
            totalQuestions: quiz.questions.length,
          }))
          .sort((a, b) => b.score - a.score);

        io.to(roomCode).emit("quiz-completed", {
          scoreboard: finalScoreboard,
          roomCode,
        });

        // Clear auto-end timer
        const timer = quizTimers.get(roomCode);
        if (timer) {
          clearTimeout(timer);
          quizTimers.delete(roomCode);
        }
      } catch (error) {
        console.error("Error ending quiz:", error);
        socket.emit("error", { message: "Failed to end quiz" });
      }
    });

    // Clean up on disconnect
    socket.on("disconnect", () => {
      const roomCode = socket.data.roomCode;
      if (roomCode) {
        const room = rooms.get(roomCode);
        if (room) {
          if (socket.data.isHost) {
            io.to(roomCode).emit("host-disconnected");
            rooms.delete(roomCode);

            const timer = quizTimers.get(roomCode);
            if (timer) {
              clearTimeout(timer);
              quizTimers.delete(roomCode);
            }
          } else {
            room.participants.delete(socket.id);
          }
        }
      }
    });
  });
};
