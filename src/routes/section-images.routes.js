const { Router } = require('express');
const { getSectionImages } = require('../controllers/section-images.controller');

const router = Router();

router.get('/', getSectionImages);

module.exports = router;
