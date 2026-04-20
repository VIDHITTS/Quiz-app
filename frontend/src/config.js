// API Configuration
const config = {
  // Auto-detect based on hostname for more reliable deployment detection
  API_BASE:
    window.location.hostname === "localhost"
      ? "http://localhost:3040"
      : "https://quiz-app-5wb5.vercel.app",
};

export default config;
