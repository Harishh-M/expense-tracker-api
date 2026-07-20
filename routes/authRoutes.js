// routes/authRoutes.js
// Purpose: Maps URLs + HTTP methods to controller functions.
// Routes should contain NO business logic — just wiring.

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe); // protected: requires valid JWT

module.exports = router;
