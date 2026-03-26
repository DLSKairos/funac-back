const bcrypt = require('bcrypt');
const { query } = require('../config/database');
const { generateToken } = require('../utils/jwt.utils');

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Usuario y contrasena son requeridos' });
  }

  const result = await query(
    'SELECT id, username, email, password_hash, activo FROM usuarios_admin WHERE username = $1',
    [username]
  );

  const usuario = result.rows[0];

  if (!usuario) {
    return res.status(401).json({ success: false, error: 'Credenciales invalidas' });
  }

  if (!usuario.activo) {
    return res.status(401).json({ success: false, error: 'Usuario desactivado' });
  }

  const passwordValido = await bcrypt.compare(password, usuario.password_hash);

  if (!passwordValido) {
    return res.status(401).json({ success: false, error: 'Credenciales invalidas' });
  }

  const token = generateToken({ id: usuario.id, username: usuario.username, email: usuario.email });

  // Actualizar ultimo acceso (fire and forget)
  query('UPDATE usuarios_admin SET ultimo_acceso = NOW() WHERE id = $1', [usuario.id]).catch(console.error);

  // Registrar en logs (fire and forget)
  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion, ip_address) VALUES ($1, $2, $3, $4)",
    [usuario.id, 'login', 'Inicio de sesion exitoso', req.ip]
  ).catch(console.error);

  res.json({
    success: true,
    data: {
      token,
      usuario: { id: usuario.id, username: usuario.username, email: usuario.email },
    },
    message: 'Inicio de sesion exitoso',
  });
};

const refresh = async (req, res) => {
  const { id, username, email } = req.user;
  const token = generateToken({ id, username, email });

  res.json({
    success: true,
    data: { token },
    message: 'Token renovado exitosamente',
  });
};

const logout = async (req, res) => {
  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion, ip_address) VALUES ($1, $2, $3, $4)",
    [req.user.id, 'logout', 'Cierre de sesion', req.ip]
  ).catch(console.error);

  res.json({ success: true, message: 'Sesion cerrada exitosamente' });
};

module.exports = { login, refresh, logout };
