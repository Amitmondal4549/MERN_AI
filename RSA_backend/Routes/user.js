const express = require("express");
const router = express.Router();
const rateLimit = require('express-rate-limit');
const UserController = require('../Controllers/user')
const { authMiddleware, adminGuard } = require('../utils/firebaseAdmin');
const { registerUser } = require('../utils/validators');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' },
});

router.post('/', authLimiter, authMiddleware, registerUser, UserController.register)
router.get('/', authMiddleware, UserController.getUser)
router.get('/stats', authMiddleware, adminGuard, UserController.getStats)

module.exports = router;
