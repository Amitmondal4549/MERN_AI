const express = require("express");
const router = express.Router();
const UserController = require('../Controllers/user')
const { authMiddleware } = require('../utils/firebaseAdmin');
const { registerUser } = require('../utils/validators');

router.post('/', authMiddleware, registerUser, UserController.register)

module.exports = router;
