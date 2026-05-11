const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers } = require('../controllers/UserController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/', protect, authorize('ADMIN'), getUsers);

module.exports = router;
