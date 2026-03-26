const { Router } = require('express');
const { login, refresh, logout } = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = Router();

router.post('/login', authLimiter, login);
router.post('/refresh', authMiddleware, refresh);
router.post('/logout', authMiddleware, logout);

module.exports = router;
