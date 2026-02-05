import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Users,
  Award,
  Calendar,
  ArrowLeft,
  Eye,
  BarChart3,
  Trophy,
  Target,
  ArrowUpDown,
  Search,
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
import toast from "react-hot-toast";
import config from "../config";

const API_BASE = config.API_BASE;

function QuizResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [sortBy, setSortBy] = useState("score");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchResults();
  }, [id]);

  const fetchResults = async () => {
    try {
      const response = await fetch(`${API_BASE}/quizzes/${id}/results`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setQuizData(data);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to load results");
        navigate("/dashboard");
      }
    } catch (error) {
      toast.error("Network error");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return "text-green-600 bg-green-50";
    if (percentage >= 60) return "text-blue-600 bg-blue-50";
    if (percentage >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!quizData) return null;

  const { quiz, stats, results } = quizData;

  const filteredAndSorted = [...results]
    .filter((r) =>
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "score") return b.percentage - a.percentage;
      return new Date(b.attemptedAt) - new Date(a.attemptedAt);
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                {quiz.title}
              </h1>
              <p className="text-gray-600">{quiz.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">{quiz.totalQuestions} Questions</Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Attempts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.totalAttempts}
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.averageScore}%
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Highest Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.highestScore}%
                  </div>
                  <Trophy className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Lowest Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">
                    {stats.lowestScore}%
                  </div>
                  <Target className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Scoreboard
                  </CardTitle>
                  <CardDescription>
                    {results.length} total attempts
                  </CardDescription>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 w-48"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortBy(sortBy === "score" ? "date" : "score")}
                  >
                    <ArrowUpDown className="w-4 h-4 mr-1" />
                    {sortBy === "score" ? "By Score" : "By Date"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredAndSorted.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    {searchQuery ? "No matching students found" : "No attempts yet"}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {searchQuery
                      ? "Try a different search term"
                      : "Results will appear here when students take the quiz"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Rank
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Student
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Score
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Percentage
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSorted.map((result, index) => (
                        <motion.tr
                          key={result.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {index === 0 && (
                                <Trophy className="w-5 h-5 text-yellow-500" />
                              )}
                              <span className="font-semibold text-gray-700">
                                #{index + 1}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {result.studentName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {result.studentEmail}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-semibold text-gray-900">
                              {result.score}/{result.totalQuestions}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              className={`${getScoreColor(result.percentage)}`}
                            >
                              {result.percentage}%
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-4 h-4" />
                              {formatDate(result.attemptedAt)}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default QuizResults;
