import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import config from "./config";
import "./App.css";

import NavbarNew from "./components/NavbarNew";
import HomeNew from "./pages/HomeNew";
import LoginNew from "./pages/LoginNew";
import RegisterNew from "./pages/RegisterNew";
import DashboardNew from "./pages/DashboardNew";
import QuizList from "./pages/QuizList";
import QuizCreate from "./pages/QuizCreate";
import QuizTake from "./pages/QuizTake";
import QuizEdit from "./pages/QuizEdit";
import Profile from "./pages/Profile";

const API_BASE = config.API_BASE;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user) {
          setUser(data.user);
        } else {
          await checkAuth();
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log("Attempting registration to:", `${API_BASE}/register`);
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user) {
          setUser(data.user);
        } else {
          await checkAuth();
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      setUser(null);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#10b981",
            color: "#fff",
            fontWeight: "bold",
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
          },
        }}
      />
      <div className="App">
        <NavbarNew user={user} logout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeNew user={user} />} />
            <Route
              path="/login"
              element={
                user ? <Navigate to="/dashboard" /> : <LoginNew login={login} />
              }
            />
            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <RegisterNew register={register} />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                user ? <DashboardNew user={user} /> : <Navigate to="/login" />
              }
            />
            <Route path="/quizzes" element={<QuizList user={user} />} />
            <Route
              path="/create-quiz"
              element={
                user ? <QuizCreate user={user} /> : <Navigate to="/login" />
              }
            />
            <Route path="/quiz/:id" element={<QuizTake user={user} />} />
            <Route
              path="/edit-quiz/:id"
              element={
                user ? <QuizEdit user={user} /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/profile"
              element={
                user ? <Profile user={user} /> : <Navigate to="/login" />
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
