const { Router } = require('express');
const {
  getSocial,
  updateSocial,
  getWhatsapp,
  updateWhatsapp,
  changePassword,
  getLogs,
} = require('../../controllers/admin/settings.controller');
const authMiddleware = require('../../middlewares/auth');

const router = Router();

router.use(authMiddleware);

// Redes sociales
router.get('/social', getSocial);
router.put('/social', updateSocial);

// WhatsApp
router.get('/whatsapp', getWhatsapp);
router.put('/whatsapp', updateWhatsapp);

// Contrasena
router.put('/password', changePassword);

// Logs
router.get('/logs', getLogs);

module.exports = router;
