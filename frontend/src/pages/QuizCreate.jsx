import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./QuizCreate.css";

const API_BASE = "http://localhost:3451";
const FRONTEND_BASE = "http://localhost:5174";

function QuizCreate({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState(null);
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    isPublic: true,
    accessPin: "",
    questions: [
      {
        text: "",
        options: [
          { text: "", correct: false },
          { text: "", correct: false },
        ],
      },
    ],
  });

  const handleQuizChange = (field, value) => {
    setQuiz({ ...quiz, [field]: value });
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [field]: value,
    };
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].options[optionIndex] = {
      ...updatedQuestions[questionIndex].options[optionIndex],
      [field]: value,
    };

    // make sure only one option is correct
    if (field === "correct" && value) {
      updatedQuestions[questionIndex].options.forEach((option, index) => {
        if (index !== optionIndex) {
          option.correct = false;
        }
      });
    }

    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          text: "",
          options: [
            { text: "", correct: false },
            { text: "", correct: false },
          ],
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    if (quiz.questions.length > 1) {
      const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].options.push({ text: "", correct: false });
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...quiz.questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  const validateQuiz = () => {
    if (!quiz.title.trim()) {
      setError("Quiz title is required");
      return false;
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];

      if (!question.text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return false;
      }

      const validOptions = question.options.filter((opt) => opt.text.trim());
      if (validOptions.length < 2) {
        setError(`Question ${i + 1} must have at least 2 options`);
        return false;
      }

      const correctOptions = question.options.filter(
        (opt) => opt.correct && opt.text.trim()
      );
      if (correctOptions.length !== 1) {
        setError(`Question ${i + 1} must have exactly one correct answer`);
        return false;
      }
    }

    if (!quiz.isPublic && !quiz.accessPin.trim()) {
      setError("Private quiz requires an access PIN");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateQuiz()) {
      return;
    }

    setLoading(true);

    try {
      const quizData = {
        ...quiz,
        questions: quiz.questions.map((q) => ({
          ...q,
          options: q.options.filter((opt) => opt.text.trim()),
        })),
      };

      const response = await fetch(`${API_BASE}/quizzes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(quizData),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedQuizId(data.quiz._id);
        setShowSuccessModal(true);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create quiz");
      }
    } catch (error) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to create a quiz.</div>;
  }

  const copyQuizLink = async () => {
    const quizLink = `${FRONTEND_BASE}/quiz/${createdQuizId}`;
    try {
      await navigator.clipboard.writeText(quizLink);
      alert('Quiz link copied to clipboard!');
    } catch (err) {
      // fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = quizLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Quiz link copied to clipboard!');
    }
  };

  const closeModalAndRedirect = () => {
    setShowSuccessModal(false);
    navigate("/dashboard");
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Create New Quiz</h1>
        <p>Build an engaging quiz for others to take</p>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="quiz-details">
          <div className="form-group">
            <label>Quiz Title *</label>
            <input
              type="text"
              value={quiz.title}
              onChange={(e) => handleQuizChange("title", e.target.value)}
              placeholder="Enter quiz title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={quiz.description}
              onChange={(e) => handleQuizChange("description", e.target.value)}
              placeholder="Brief description of your quiz"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={quiz.isPublic}
                onChange={(e) => handleQuizChange("isPublic", e.target.checked)}
              />
              Public Quiz (anyone can take it)
            </label>
          </div>

          {!quiz.isPublic && (
            <div className="form-group">
              <label>Access PIN *</label>
              <input
                type="text"
                value={quiz.accessPin}
                onChange={(e) => handleQuizChange("accessPin", e.target.value)}
                placeholder="Enter PIN for private access"
                required
              />
            </div>
          )}
        </div>

        <div className="questions-section">
          <h2>Questions</h2>

          {quiz.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="question-builder">
              <div className="question-header">
                <h3>Question {questionIndex + 1}</h3>
                {quiz.questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="btn btn-danger"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) =>
                    handleQuestionChange(questionIndex, "text", e.target.value)
                  }
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div className="options-section">
                <label>Answer Options *</label>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="option-builder">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) =>
                        handleOptionChange(
                          questionIndex,
                          optionIndex,
                          "text",
                          e.target.value
                        )
                      }
                      placeholder={`Option ${optionIndex + 1}`}
                    />
                    <label className="correct-label">
                      <input
                        type="radio"
                        name={`correct-${questionIndex}`}
                        checked={option.correct}
                        onChange={(e) =>
                          handleOptionChange(
                            questionIndex,
                            optionIndex,
                            "correct",
                            e.target.checked
                          )
                        }
                      />
                      Correct
                    </label>
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="btn btn-small btn-danger"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addOption(questionIndex)}
                  className="btn btn-secondary btn-small"
                >
                  Add Option
                </button>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="btn btn-secondary"
          >
            Add Question
          </button>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating Quiz..." : "Create Quiz"}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="modal-header">
              <h2>🎉 Quiz Created Successfully!</h2>
            </div>
            <div className="modal-content">
              <p>Your quiz is ready and can be attempted by others!</p>
              <div className="quiz-link-section">
                <label>Share this link:</label>
                <div className="link-display">
                  <input 
                    type="text" 
                    value={`${FRONTEND_BASE}/quiz/${createdQuizId}`}
                    readOnly
                    className="quiz-link-input"
                  />
                  <button 
                    type="button"
                    onClick={copyQuizLink}
                    className="btn btn-primary copy-btn"
                  >
                    📋 Copy Link
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                type="button"
                onClick={closeModalAndRedirect}
                className="btn btn-outline"
              >
                Go to Dashboard
              </button>
              <button 
                type="button"
                onClick={() => navigate(`/quiz/${createdQuizId}`)}
                className="btn btn-primary"
              >
                Preview Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizCreate;
