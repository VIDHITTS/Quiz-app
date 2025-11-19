import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Lock,
  Globe,
  Save,
  AlertCircle,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import config from "../config";

const API_BASE = config.API_BASE;

function QuizEdit({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    isPublic: true,
    accessPin: "",
    questions: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      fetchQuiz();
    } else {
      navigate("/login");
    }
  }, [id, user, navigate]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${id}`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        // Convert backend isPublic to frontend format and ensure correct field names
        const fetchedQuiz = {
          ...data.quiz,
          isPublic:
            data.quiz.isPublic !== undefined ? data.quiz.isPublic : true,
          accessPin: data.quiz.accessPin || "",
        };
        setQuiz(fetchedQuiz);
      } else {
        setError("Quiz not found or not authorized");
      }
    } catch (error) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setQuiz({
      ...quiz,
      [name]: type === "checkbox" ? checked : value,
    });
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
            { text: "", correct: false },
            { text: "", correct: false },
          ],
        },
      ],
    });
  };

  const removeQuestion = (questionIndex) => {
    setQuiz({
      ...quiz,
      questions: quiz.questions.filter((_, index) => index !== questionIndex),
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
            if (field === "correct" && value) {
              return { ...option, [field]: value };
            }
            return { ...option, [field]: value };
          } else if (field === "correct" && value) {
            // Uncheck other options
            return { ...option, correct: false };
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
    setError("");

    if (!quiz.title.trim()) {
      setError("Quiz title is required");
      setSaving(false);
      return;
    }

    if (quiz.questions.length === 0) {
      setError("At least one question is required");
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

      const hasCorrectAnswer = question.options.some(
        (option) => option.correct
      );
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

    if (!quiz.isPublic && !quiz.accessPin.trim()) {
      setError("Access PIN is required for private quizzes");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/quizzes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(quiz),
      });

      if (response.ok) {
        navigate("/dashboard", {
          state: { message: "Quiz updated successfully!" },
        });
      } else {
        const data = await response.json();
        setError(data.message || "Failed to update quiz");
      }
    } catch (error) {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error && !quiz.title) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => navigate("/dashboard")} variant="default">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Edit Quiz</h1>
              <p className="text-gray-600 mt-1">
                Update your quiz details and questions
              </p>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <p className="font-medium">{error}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Set your quiz title and description
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <Input
                    name="title"
                    value={quiz.title}
                    onChange={handleInputChange}
                    placeholder="Enter an engaging quiz title"
                    required
                    className="text-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={quiz.description}
                    onChange={handleInputChange}
                    placeholder="Add a brief description of your quiz"
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Privacy Settings */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {quiz.isPublic ? (
                        <>
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Globe className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Public Quiz
                            </p>
                            <p className="text-sm text-gray-600">
                              Anyone can access this quiz
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Lock className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Private Quiz
                            </p>
                            <p className="text-sm text-gray-600">
                              Requires PIN to access
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!quiz.isPublic}
                        onChange={(e) =>
                          handleInputChange({
                            target: {
                              name: "isPublic",
                              value: !e.target.checked,
                              type: "checkbox",
                            },
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                    </label>
                  </div>

                  <AnimatePresence>
                    {!quiz.isPublic && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4"
                      >
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Access PIN *
                        </label>
                        <Input
                          name="accessPin"
                          value={quiz.accessPin}
                          onChange={handleInputChange}
                          placeholder="Enter a PIN code"
                          maxLength="10"
                          required={!quiz.isPublic}
                          className="font-mono"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Questions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Questions ({quiz.questions.length})</CardTitle>
                    <CardDescription>
                      Add and configure your quiz questions
                    </CardDescription>
                  </div>
                  <Button type="button" onClick={addQuestion} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {quiz.questions.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No questions added yet</p>
                    <Button
                      type="button"
                      onClick={addQuestion}
                      variant="default"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Question
                    </Button>
                  </div>
                ) : (
                  quiz.questions.map((question, questionIndex) => (
                    <motion.div
                      key={questionIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: questionIndex * 0.05 }}
                    >
                      <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors">
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant="default"
                              className="text-base px-3 py-1"
                            >
                              Question {questionIndex + 1}
                            </Badge>
                            {quiz.questions.length > 1 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeQuestion(questionIndex)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remove
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Question Text *
                            </label>
                            <Input
                              value={question.text}
                              onChange={(e) =>
                                updateQuestion(
                                  questionIndex,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder="Enter your question"
                              required
                              className="text-lg"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Answer Options * (Select the correct one)
                            </label>
                            <div className="space-y-3">
                              {question.options.map((option, optionIndex) => (
                                <div
                                  key={optionIndex}
                                  className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                                    option.correct
                                      ? "border-green-500 bg-green-50"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`question-${questionIndex}-correct`}
                                    checked={option.correct}
                                    onChange={(e) =>
                                      updateOption(
                                        questionIndex,
                                        optionIndex,
                                        "correct",
                                        e.target.checked
                                      )
                                    }
                                    className="w-5 h-5 text-green-600 focus:ring-2 focus:ring-green-500"
                                  />
                                  <Input
                                    value={option.text}
                                    onChange={(e) =>
                                      updateOption(
                                        questionIndex,
                                        optionIndex,
                                        "text",
                                        e.target.value
                                      )
                                    }
                                    placeholder={`Option ${optionIndex + 1}`}
                                    required
                                    className={`flex-1 ${
                                      option.correct ? "font-medium" : ""
                                    }`}
                                  />
                                  {option.correct && (
                                    <Badge
                                      variant="default"
                                      className="bg-green-600"
                                    >
                                      Correct
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 justify-end"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              disabled={saving}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              size="lg"
              className="min-w-[200px]"
            >
              {saving ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Quiz
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}

export default QuizEdit;
