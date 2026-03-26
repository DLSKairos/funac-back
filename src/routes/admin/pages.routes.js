const { Router } = require('express');
const { listPages, getPageContent, updatePage } = require('../../controllers/admin/pages.controller');
const authMiddleware = require('../../middlewares/auth');

const router = Router();

router.use(authMiddleware);

router.get('/', listPages);
router.get('/:pagina', getPageContent);
router.put('/:pagina', updatePage);

module.exports = router;
