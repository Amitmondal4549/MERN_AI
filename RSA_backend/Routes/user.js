const express = require("express");
const router = express.Router();
const UserController = require('../Controllers/user')
const { authMiddleware, adminGuard } = require('../utils/firebaseAdmin');
const { registerUser } = require('../utils/validators');

router.post('/', authMiddleware, registerUser, UserController.register)
router.get('/stats', authMiddleware, adminGuard, UserController.getStats)

module.exports = router;
