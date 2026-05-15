const { Router } = require('express');
const { getNewsModal } = require('../controllers/news-modal.controller');

const router = Router();

router.get('/', getNewsModal);

module.exports = router;
