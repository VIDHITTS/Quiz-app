import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import config from "../config";

const API_BASE = config.API_BASE;

function QuizTake({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (user) {
      fetchQuiz();
    } else {
      navigate("/login", { state: { from: `/quiz/${id}` } });
    }
  }, [id, user, navigate]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${id}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setQuiz(data.quiz);
      } else if (response.status === 403) {
        setShowPin(true);
      } else {
        setError("Quiz not found");
      }
    } catch (error) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_BASE}/quizzes/${id}/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ accessPin: pin }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuiz(data.quiz);
        setShowPin(false);
      } else {
        toast.error("Incorrect PIN");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers({
      ...answers,
      [questionId]: selectedOption,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const answersArray = Object.entries(answers).map(
        ([questionId, selectedOption]) => ({
          questionId,
          selectedOption,
        })
      );

      const response = await fetch(`${API_BASE}/attempts/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          quizId: id,
          answers: answersArray,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          `Great job! Score: ${data.attempt.score}/${data.attempt.totalQuestions}`
        );
        navigate("/dashboard", {
          state: {
            message: data.message,
            score: data.attempt.score,
            total: data.attempt.totalQuestions,
          },
        });
      } else {
        toast.error("Failed to submit quiz");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredQuestions = Object.keys(answers).length;
  const totalQuestions = quiz?.questions?.length || 0;
  const progress =
    totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !showPin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-6 h-6" />
              <CardTitle>Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <Button
              onClick={() => navigate("/quizzes")}
              className="mt-4 w-full"
            >
              Browse Quizzes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Protected Quiz</CardTitle>
              <CardDescription className="text-base mt-2">
                This quiz is private and requires an access PIN. Ask the quiz
                creator for the code to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePinSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter access PIN"
                    maxLength="10"
                    required
                    className="text-center text-2xl tracking-wider font-bold"
                  />
                </div>
                <Button type="submit" className="w-full" size="lg">
                  <Lock className="w-4 h-4 mr-2" />
                  Access Quiz
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-3xl font-black text-gray-900 mb-2">
                    {quiz.title}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {quiz.description}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-lg px-4 py-2">
                  {totalQuestions} Questions
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    Progress: {answeredQuestions} / {totalQuestions}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-600 to-blue-700 rounded-full"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {quiz.questions.map((question, index) => (
            <motion.div
              key={question._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="border-2 hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-white">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 flex-1 pt-1">
                      {question.text}
                    </CardTitle>
                    {answers[question._id] && (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {question.options.map((option, optIndex) => {
                      const isSelected = answers[question._id] === option.text;
                      const optionLetter = String.fromCharCode(65 + optIndex);

                      return (
                        <motion.label
                          key={option._id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 shadow-md"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question._id}`}
                            value={option.text}
                            checked={isSelected}
                            onChange={() =>
                              handleAnswerChange(question._id, option.text)
                            }
                            className="sr-only"
                            required
                          />
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm mr-4 ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-gray-300 text-gray-500"
                            }`}
                          >
                            {optionLetter}
                          </div>
                          <span
                            className={`flex-1 text-base ${
                              isSelected
                                ? "font-semibold text-gray-900"
                                : "text-gray-700"
                            }`}
                          >
                            {option.text}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          )}
                        </motion.label>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + quiz.questions.length * 0.1 }}
            className="sticky bottom-4"
          >
            <Card className="border-2 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-lg">
                      Ready to submit?
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {answeredQuestions === totalQuestions
                        ? "All questions answered! You can submit now."
                        : `Please answer ${
                            totalQuestions - answeredQuestions
                          } more question${
                            totalQuestions - answeredQuestions !== 1 ? "s" : ""
                          } to submit.`}
                    </p>
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    disabled={submitting || answeredQuestions < totalQuestions}
                    className="text-lg px-8"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Quiz
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

export default QuizTake;
