const { Router } = require('express');
const { getNewsModal, updateNewsModal } = require('../../controllers/admin/news-modal.controller');
const authMiddleware = require('../../middlewares/auth');

const router = Router();

router.use(authMiddleware);

router.get('/', getNewsModal);
router.put('/', updateNewsModal);

module.exports = router;
