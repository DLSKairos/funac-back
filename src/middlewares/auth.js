const { verifyToken } = require('../utils/jwt.utils');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Token de autenticacion requerido' });
  }

  const token = authHeader.split(' ')[1];

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ success: false, error: 'Token invalido o expirado' });
  }

  req.user = decoded;
  next();
};

module.exports = authMiddleware;
