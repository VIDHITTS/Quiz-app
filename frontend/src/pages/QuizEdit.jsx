import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './QuizCreate.css'; // Reuse the same styling

const API_BASE = 'http://localhost:3451';

function QuizEdit({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    isPrivate: false,
    accessPin: '',
    questions: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchQuiz();
    } else {
      navigate('/login');
    }
  }, [id, user, navigate]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${id}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setQuiz(data.quiz);
      } else {
        setError('Quiz not found or not authorized');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuiz({
      ...quiz,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, {
        text: '',
        options: [
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ]
      }]
    });
  };

  const removeQuestion = (questionIndex) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.filter((_, index) => index !== questionIndex)
    });
  };

  const updateQuestion = (questionIndex, field, value) => {
    const updatedQuestions = quiz.questions.map((question, index) => {
      if (index === questionIndex) {
        return { ...question, [field]: value };
      }
      return question;
    });
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updatedQuestions = quiz.questions.map((question, qIndex) => {
      if (qIndex === questionIndex) {
        const updatedOptions = question.options.map((option, oIndex) => {
          if (oIndex === optionIndex) {
            // If setting this option as correct, mark others as false
            if (field === 'isCorrect' && value) {
              return { ...option, [field]: value };
            }
            return { ...option, [field]: value };
          } else if (field === 'isCorrect' && value) {
            // Uncheck other options
            return { ...option, isCorrect: false };
          }
          return option;
        });
        return { ...question, options: updatedOptions };
      }
      return question;
    });
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Validation
    if (!quiz.title.trim()) {
      setError('Quiz title is required');
      setSaving(false);
      return;
    }

    if (quiz.questions.length === 0) {
      setError('At least one question is required');
      setSaving(false);
      return;
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      if (!question.text.trim()) {
        setError(`Question ${i + 1} text is required`);
        setSaving(false);
        return;
      }

      const hasCorrectAnswer = question.options.some(option => option.isCorrect);
      if (!hasCorrectAnswer) {
        setError(`Question ${i + 1} must have a correct answer`);
        setSaving(false);
        return;
      }

      for (let j = 0; j < question.options.length; j++) {
        if (!question.options[j].text.trim()) {
          setError(`Question ${i + 1}, option ${j + 1} is required`);
          setSaving(false);
          return;
        }
      }
    }

    if (quiz.isPrivate && !quiz.accessPin.trim()) {
      setError('Access PIN is required for private quizzes');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/quizzes/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(quiz),
      });

      if (response.ok) {
        navigate('/dashboard', { state: { message: 'Quiz updated successfully!' } });
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update quiz');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  if (loading) return <div className="loading">Loading quiz...</div>;
  if (error && !quiz.title) return <div className="error">{error}</div>;

  return (
    <div className="quiz-create">
      <div className="quiz-header">
        <h1>Edit Quiz</h1>
        <p>Update your quiz details, questions, and settings</p>
      </div>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="form-group">
          <label htmlFor="title">Quiz Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={quiz.title}
            onChange={handleInputChange}
            placeholder="Enter quiz title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={quiz.description}
            onChange={handleInputChange}
            placeholder="Enter quiz description"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isPrivate"
              checked={quiz.isPrivate}
              onChange={handleInputChange}
            />
            <span>Private Quiz (requires PIN)</span>
          </label>
        </div>

        {quiz.isPrivate && (
          <div className="form-group">
            <label htmlFor="accessPin">Access PIN *</label>
            <input
              type="text"
              id="accessPin"
              name="accessPin"
              value={quiz.accessPin}
              onChange={handleInputChange}
              placeholder="Enter access PIN"
              maxLength="10"
              required
            />
          </div>
        )}

        <div className="questions-section">
          <div className="section-header">
            <h2>Questions ({quiz.questions.length})</h2>
            <button
              type="button"
              onClick={addQuestion}
              className="btn btn-secondary"
            >
              Add Question
            </button>
          </div>

          {quiz.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="question-card">
              <div className="question-header">
                <h3>Question {questionIndex + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeQuestion(questionIndex)}
                  className="btn btn-danger btn-small"
                >
                  Remove
                </button>
              </div>

              <div className="form-group">
                <label>Question Text *</label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(questionIndex, 'text', e.target.value)}
                  placeholder="Enter your question"
                  required
                />
              </div>

              <div className="options-section">
                <label>Answer Options *</label>
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="option-group">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(questionIndex, optionIndex, 'text', e.target.value)}
                      placeholder={`Option ${optionIndex + 1}`}
                      required
                    />
                    <label className="checkbox-label">
                      <input
                        type="radio"
                        name={`question-${questionIndex}-correct`}
                        checked={option.isCorrect}
                        onChange={(e) => updateOption(questionIndex, optionIndex, 'isCorrect', e.target.checked)}
                      />
                      <span>Correct</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {quiz.questions.length === 0 && (
            <div className="empty-state">
              <p>No questions added yet.</p>
              <button
                type="button"
                onClick={addQuestion}
                className="btn btn-primary"
              >
                Add Your First Question
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Update Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default QuizEdit;