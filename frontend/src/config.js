// API Configuration
const config = {
  // Auto-detect based on hostname for more reliable deployment detection
  API_BASE: window.location.hostname === 'localhost' 
    ? 'http://localhost:3451'
    : 'https://quiz-app-production-13bd.up.railway.app'
};

export default config;