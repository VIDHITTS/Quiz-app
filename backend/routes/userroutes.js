const express = require('express');
const { getProfile, updateProfile, getDashboard } = require('../controllers/usercontroller.js');
const protect = require('../middleware/authmiddleware.js');

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Get user profile
router.get('/profile', getProfile);

// Update user profile
router.put('/profile', updateProfile);

// Get dashboard data
router.get('/dashboard', getDashboard);

module.exports = router;