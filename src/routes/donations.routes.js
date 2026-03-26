const { Router } = require('express');
const { initDonation, handleWebhook, getDonationStatus } = require('../controllers/donations.controller');

const router = Router();

router.post('/init', initDonation);
router.post('/webhook', handleWebhook);
router.get('/:referencia/status', getDonationStatus);

module.exports = router;
