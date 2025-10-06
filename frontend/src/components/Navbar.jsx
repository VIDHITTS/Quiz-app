import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar({ user, logout }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          Quiz App
        </Link>

        <div className="nav-menu">
          <Link to="/quizzes" className="nav-link">
            All Quizzes
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              <Link to="/create-quiz" className="nav-link">
                Create Quiz
              </Link>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <button onClick={logout} className="nav-button logout">
                Logout
              </button>
              <span className="nav-user">Hi, {user.name}!</span>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-button">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
