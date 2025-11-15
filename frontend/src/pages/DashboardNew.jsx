import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { TrendingUp, Edit, Eye, Plus, Award, ClipboardList, Target, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import config from "../config";

const API_BASE = config.API_BASE;

function DashboardNew({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchDashboardData();

    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/dashboard`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.dashboard);
      } else {
        toast.error("Failed to load dashboard data");
      }
    } catch (error) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Quizzes Created",
      value: dashboardData?.stats?.totalQuizzes || 0,
      icon: <ClipboardList className="w-8 h-8" />,
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Quizzes Taken",
      value: dashboardData?.stats?.totalAttempts || 0,
      icon: <Target className="w-8 h-8" />,
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "Average Score",
      value: `${dashboardData?.stats?.averageScore || 0}%`,
      icon: <Award className="w-8 h-8" />,
      gradient: "from-emerald-500 to-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600">Here's your quiz activity overview</p>
            </div>
            <Link to="/create-quiz">
              <Button variant="primary" size="lg" className="group">
                <Plus className="w-5 h-5 mr-2" />
                Create New Quiz
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-2">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm font-semibold mb-2">{stat.title}</p>
                      <p className="text-4xl font-black text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-4 ${stat.bg} rounded-2xl`}>
                      <div className={`bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Quizzes Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Recent Quizzes</CardTitle>
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardDescription>Quizzes you've created recently</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentQuizzes?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentQuizzes.map((quiz, index) => (
                      <motion.div
                        key={quiz._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        <Card className="hover:shadow-md transition-all duration-200">
                          <CardContent className="p-4">
                            <h3 className="font-bold text-gray-900 mb-2">
                              {quiz.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {quiz.description || "No description"}
                            </p>
                            <div className="flex gap-2">
                              <Link to={`/edit-quiz/${quiz._id}`}>
                                <Button variant="primary" size="sm">
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              </Link>
                              <Link to={`/quiz/${quiz._id}`}>
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 mr-1" />
                                  Preview
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="w-10 h-10 text-blue-600" />
                    </div>
                    <p className="text-gray-600 mb-4">You haven't created any quizzes yet.</p>
                    <Link to="/create-quiz">
                      <Button variant="primary">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Quiz
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Attempts Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Recent Attempts</CardTitle>
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <CardDescription>Your recent quiz attempts</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentAttempts?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentAttempts.map((attempt, index) => (
                      <motion.div
                        key={attempt._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        <Card className="hover:shadow-md transition-all duration-200">
                          <CardContent className="p-4">
                            <h4 className="font-bold text-gray-900 mb-3">
                              {attempt.quiz.title}
                            </h4>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Badge
                                  variant={
                                    attempt.percentage >= 70
                                      ? "success"
                                      : attempt.percentage >= 50
                                      ? "secondary"
                                      : "destructive"
                                  }
                                >
                                  {attempt.score}/{attempt.totalQuestions}
                                </Badge>
                                <span className="text-2xl font-black text-gray-900">
                                  {attempt.percentage}%
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(attempt.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-10 h-10 text-purple-600" />
                    </div>
                    <p className="text-gray-600 mb-4">You haven't taken any quizzes yet.</p>
                    <Link to="/quizzes">
                      <Button variant="primary">
                        <ClipboardList className="w-4 h-4 mr-2" />
                        Browse Quizzes
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default DashboardNew;