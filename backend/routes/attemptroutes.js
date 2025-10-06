const express = require('express');
const { submitAttempt, getUserAttempts, getAttemptById } = require('../controllers/attemptcontrol.js');
const protect = require('../middleware/authmiddleware.js');

const router = express.Router();

router.use(protect);

router.post('/submit', submitAttempt);
router.get('/my-attempts', getUserAttempts);
router.get('/:id', getAttemptById);

module.exports = router;