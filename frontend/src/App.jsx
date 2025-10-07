import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import config from "./config";
import "./App.css";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
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
    checkAuth(); // see if user is logged in
  }, []);

  const checkAuth = async () => {
    try {
      console.log('Checking authentication...');
      const response = await fetch(`${API_BASE}/users/profile`, {
        credentials: "include",
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Auth check response:', data);
        if (data.success && data.user) {
          setUser(data.user);
        }
      } else {
        console.log('Auth check failed with status:', response.status);
        // Clear any existing user data if auth check fails
        setUser(null);
      }
    } catch (error) {
      console.log("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login to:', `${API_BASE}/login`);
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, data });

      if (response.ok) {
        // Set user data immediately if available in response
        if (data.user) {
          setUser(data.user);
        } else {
          // Fallback: fetch user profile
          await checkAuth();
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error" };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('Attempting registration to:', `${API_BASE}/register`);
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      console.log('Registration response:', { status: response.status, data });

      if (response.ok) {
        // Set user data immediately from response
        if (data.user) {
          setUser(data.user);
        } else {
          // Fallback: fetch user profile
          await checkAuth();
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
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
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Navbar user={user} logout={logout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route
              path="/login"
              element={
                user ? <Navigate to="/dashboard" /> : <Login login={login} />
              }
            />
            <Route
              path="/register"
              element={
                user ? (
                  <Navigate to="/dashboard" />
                ) : (
                  <Register register={register} />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                user ? <Dashboard user={user} /> : <Navigate to="/login" />
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
