import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Trash2, Lock, Globe, Copy, Check, X, AlertCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import config from "../config";

const API_BASE = config.API_BASE;
const FRONTEND_BASE = window.location.origin;

function QuizCreate({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState(null);
  const [copied, setCopied] = useState(false);
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
      toast.error("Quiz title is required");
      return false;
    }

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];

      if (!question.text.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }

      const validOptions = question.options.filter((opt) => opt.text.trim());
      if (validOptions.length < 2) {
        toast.error(`Question ${i + 1} must have at least 2 options`);
        return false;
      }

      const correctOptions = question.options.filter(
        (opt) => opt.correct && opt.text.trim()
      );
      if (correctOptions.length !== 1) {
        toast.error(`Question ${i + 1} must have exactly one correct answer`);
        return false;
      }
    }

    if (!quiz.isPublic && !quiz.accessPin.trim()) {
      toast.error("Private quiz requires an access PIN");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        toast.success("Quiz created successfully!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to create quiz");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const copyQuizLink = async () => {
    const quizLink = `${FRONTEND_BASE}/quiz/${createdQuizId}`;
    try {
      await navigator.clipboard.writeText(quizLink);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Please log in to create a quiz.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
              Create New Quiz
            </h1>
            <p className="text-xl text-gray-600">
              Build an engaging quiz and share it with the world
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Quiz Details</CardTitle>
                <CardDescription>Basic information about your quiz</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="title" className="block text-sm font-bold text-gray-700">
                    Quiz Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    id="title"
                    value={quiz.title}
                    onChange={(e) => handleQuizChange("title", e.target.value)}
                    placeholder="e.g., JavaScript Fundamentals Quiz"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="block text-sm font-bold text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={quiz.description}
                    onChange={(e) => handleQuizChange("description", e.target.value)}
                    placeholder="Brief description of your quiz..."
                    rows="3"
                    className="flex w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-2.5 text-sm transition-all placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500"
                  />
                </div>

                {/* Privacy Settings - Highlighted */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      {quiz.isPublic ? (
                        <Globe className="w-5 h-5 text-white" />
                      ) : (
                        <Lock className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">Privacy Settings</h3>
                      <p className="text-sm text-gray-600">
                        Control who can access your quiz
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-start space-x-3 cursor-pointer group">
                      <div className="flex items-center h-6">
                        <input
                          type="checkbox"
                          checked={quiz.isPublic}
                          onChange={(e) => handleQuizChange("isPublic", e.target.checked)}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          Make this quiz public
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          Anyone with the link can take this quiz without a PIN
                        </p>
                      </div>
                    </label>

                    {!quiz.isPublic && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 pt-2"
                      >
                        <div className="flex items-center space-x-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span className="font-semibold">
                            Users will need a PIN to access this quiz
                          </span>
                        </div>
                        <label htmlFor="pin" className="block text-sm font-bold text-gray-700">
                          Access PIN <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          id="pin"
                          value={quiz.accessPin}
                          onChange={(e) => handleQuizChange("accessPin", e.target.value)}
                          placeholder="Enter a PIN (e.g., 1234)"
                          required={!quiz.isPublic}
                        />
                      </motion.div>
                    )}
                  </div>
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
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Questions</CardTitle>
                    <CardDescription>Add questions and answer options</CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {quiz.questions.length} {quiz.questions.length === 1 ? "Question" : "Questions"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {quiz.questions.map((question, questionIndex) => (
                  <Card key={questionIndex} className="border-2 bg-gray-50">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Question {questionIndex + 1}</CardTitle>
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
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-gray-700">
                          Question Text <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="text"
                          value={question.text}
                          onChange={(e) =>
                            handleQuestionChange(questionIndex, "text", e.target.value)
                          }
                          placeholder="Enter your question..."
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700">
                          Answer Options <span className="text-red-500">*</span>
                        </label>
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-2">
                            <Input
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
                              className="flex-1"
                            />
                            <label className="flex items-center space-x-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg cursor-pointer hover:border-emerald-500 transition-colors">
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
                                className="w-4 h-4 text-emerald-600"
                              />
                              <span className="text-sm font-semibold text-gray-700">
                                Correct
                              </span>
                            </label>
                            {question.options.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => removeOption(questionIndex, optionIndex)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addOption(questionIndex)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addQuestion}
                  className="w-full"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/dashboard")}
              size="lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              size="lg"
            >
              {loading ? "Creating Quiz..." : "Create Quiz"}
            </Button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Quiz Created Successfully!
                </h2>
                <p className="text-gray-600">
                  Your quiz is ready to be shared with others
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Share this link:
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={`${FRONTEND_BASE}/quiz/${createdQuizId}`}
                      readOnly
                      className="flex-1 text-sm"
                    />
                    <Button
                      type="button"
                      variant={copied ? "success" : "primary"}
                      onClick={copyQuizLink}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowSuccessModal(false);
                      navigate("/dashboard");
                    }}
                    className="flex-1"
                  >
                    Dashboard
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => navigate(`/quiz/${createdQuizId}`)}
                    className="flex-1"
                  >
                    Preview Quiz
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default QuizCreate;