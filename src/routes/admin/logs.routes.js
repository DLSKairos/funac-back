const { Router } = require('express');
const { getLogs } = require('../../controllers/admin/settings.controller');
const authMiddleware = require('../../middlewares/auth');

const router = Router();

router.use(authMiddleware);
router.get('/', getLogs);

module.exports = router;
