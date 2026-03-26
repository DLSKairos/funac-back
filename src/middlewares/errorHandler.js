const multer = require('multer');

const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} ${req.method} ${req.path}:`, err);

  // Errores de Multer
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'El archivo supera el tamano maximo permitido' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ success: false, error: err.field || 'Tipo de archivo no permitido' });
    }
    return res.status(400).json({ success: false, error: `Error al subir archivo: ${err.message}` });
  }

  // Error de tipo de archivo (lanzado manualmente desde fileFilter)
  if (err.message && err.message.includes('Solo se permiten')) {
    return res.status(400).json({ success: false, error: err.message });
  }

  // Error de validacion de Joi
  if (err.name === 'ValidationError' && err.isJoi) {
    return res.status(400).json({
      success: false,
      error: err.details ? err.details[0].message : err.message,
    });
  }

  // Error de PostgreSQL: unique violation
  if (err.code === '23505') {
    return res.status(409).json({ success: false, error: 'El registro ya existe (valor duplicado)' });
  }

  // Error de PostgreSQL: foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ success: false, error: 'Referencia a registro inexistente' });
  }

  // Error de PostgreSQL: not null violation
  if (err.code === '23502') {
    return res.status(400).json({ success: false, error: `Campo requerido faltante: ${err.column}` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Token invalido' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expirado' });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Error interno del servidor';

  const response = { success: false, error: message };

  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
