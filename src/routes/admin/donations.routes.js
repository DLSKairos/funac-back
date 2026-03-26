const { Router } = require('express');
const {
  listDonations,
  getDonation,
  resendReceipt,
  exportDonations,
} = require('../../controllers/admin/donations.controller');
const authMiddleware = require('../../middlewares/auth');

const router = Router();

router.use(authMiddleware);

router.get('/', listDonations);
router.get('/export', exportDonations);
router.get('/:id', getDonation);
router.post('/:id/resend-receipt', resendReceipt);

module.exports = router;
