const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '8h';

const generateToken = (payload) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no esta configurado en las variables de entorno');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET no esta configurado en las variables de entorno');
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
