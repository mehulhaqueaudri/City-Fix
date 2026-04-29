const express = require('express');
const router = express.Router();
const { registerUser, registerWorker, loginUser } = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/worker/register', registerWorker); // NEW: Worker Route
router.post('/login', loginUser);

module.exports = router;