import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
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

const API_BASE = "http://localhost:3451"; // my backend server

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth(); // see if user is logged in
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/profile`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.log("Not authenticated");
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

      if (response.ok) {
        await checkAuth(); // get user data again
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: "Network error" };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        await checkAuth(); // get user data again
        return { success: true };
      } else {
        const data = await response.json();
        return { success: false, error: data.error };
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
