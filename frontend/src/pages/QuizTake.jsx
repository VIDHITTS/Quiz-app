import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3451';

function QuizTake({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');

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
      } else if (response.status === 403) {
        setShowPin(true);
      } else {
        setError('Quiz not found');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers({
      ...answers,
      [questionId]: selectedOption
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption
      }));

      const response = await fetch(`${API_BASE}/attempts/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          quizId: id,
          answers: answersArray
        }),
      });

      if (response.ok) {
        const data = await response.json();
        navigate('/dashboard', { 
          state: { 
            message: data.message,
            score: data.attempt.score,
            total: data.attempt.totalQuestions
          }
        });
      } else {
        setError('Failed to submit quiz');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;
  if (loading) return <div className="loading">Loading quiz...</div>;
  if (error) return <div className="error">{error}</div>;

  if (showPin) {
    return (
      <div className="quiz-container">
        <div className="pin-form">
          <h2>Private Quiz</h2>
          <p>This quiz requires a PIN to access.</p>
          <form onSubmit={(e) => {
            e.preventDefault();
            // TODO: Handle PIN verification
          }}>
            <input
              type="text"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN"
              required
            />
            <button type="submit" className="btn btn-primary">
              Access Quiz
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        <p>{quiz.description}</p>
      </div>

      <form onSubmit={handleSubmit} className="quiz-form">
        {quiz.questions.map((question, index) => (
          <div key={question._id} className="question-card">
            <h3>
              {index + 1}. {question.text}
            </h3>
            <div className="options">
              {question.options.map((option) => (
                <label key={option._id} className="option">
                  <input
                    type="radio"
                    name={`question-${question._id}`}
                    value={option.text}
                    onChange={() => handleAnswerChange(question._id, option.text)}
                    required
                  />
                  {option.text}
                </label>
              ))}
            </div>
          </div>
        ))}

        <button 
          type="submit" 
          className="btn btn-primary btn-large"
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit Quiz'}
        </button>
      </form>
    </div>
  );
}

export default QuizTake;