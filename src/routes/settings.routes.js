const { Router } = require('express');
const { getSettings, getWhatsapp } = require('../controllers/pages.controller');

const router = Router();

router.get('/social', getSettings);
router.get('/whatsapp', getWhatsapp);

module.exports = router;
