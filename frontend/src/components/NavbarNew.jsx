import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  List,
  PlusCircle,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Sparkles,
} from "lucide-react";

function NavbarNew({ user, logout }) {
  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            <span className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              QuizMaster
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={<Home className="w-4 h-4" />}>
              Home
            </NavLink>
            <NavLink to="/quizzes" icon={<List className="w-4 h-4" />}>
              Quizzes
            </NavLink>

            {user ? (
              <>
                <NavLink
                  to="/dashboard"
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/create-quiz"
                  icon={<PlusCircle className="w-4 h-4" />}
                >
                  Create
                </NavLink>
                <NavLink to="/profile" icon={<User className="w-4 h-4" />}>
                  Profile
                </NavLink>

                <div className="flex items-center ml-4 space-x-3">
                  <div className="px-4 py-2 bg-gray-100 rounded-full">
                    <span className="text-sm font-semibold text-gray-700">
                      {user.name}
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={logout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 hover:shadow-lg transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </motion.button>
                </div>
              </>
            ) : (
              <div className="flex items-center ml-4 space-x-2">
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/register"
                    className="flex items-center space-x-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-200"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

function NavLink({ to, icon, children }) {
  return (
    <Link
      to={to}
      className="flex items-center space-x-2 px-4 py-2 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-all duration-200 group"
    >
      <span className="text-gray-600 group-hover:text-blue-600 transition-colors">
        {icon}
      </span>
      <span>{children}</span>
    </Link>
  );
}

export default NavbarNew;
