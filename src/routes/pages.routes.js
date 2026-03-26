const { Router } = require('express');
const { getPage } = require('../controllers/pages.controller');

const router = Router();

router.get('/:pagina', getPage);

module.exports = router;
