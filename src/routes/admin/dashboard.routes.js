const { Router } = require('express');
const { getStats, getDonationsChart } = require('../../controllers/admin/dashboard.controller');
const authMiddleware = require('../../middlewares/auth');

const router = Router();

router.use(authMiddleware);

router.get('/stats', getStats);
router.get('/donations-chart', getDonationsChart);

module.exports = router;
