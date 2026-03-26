const bcrypt = require('bcrypt');
const { query, getClient } = require('../../config/database');

// ---- REDES SOCIALES ----

const getSocial = async (req, res) => {
  const result = await query(
    'SELECT plataforma, url, activo FROM configuracion_redes_sociales ORDER BY plataforma ASC',
    []
  );

  const social = {};
  for (const row of result.rows) {
    social[row.plataforma] = { url: row.url, activo: row.activo };
  }

  res.json({ success: true, data: social });
};

const updateSocial = async (req, res) => {
  const data = req.body;

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ success: false, error: 'Datos invalidos' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    for (const [plataforma, config] of Object.entries(data)) {
      await client.query(
        `INSERT INTO configuracion_redes_sociales (plataforma, url, activo)
         VALUES ($1, $2, $3)
         ON CONFLICT (plataforma) DO UPDATE SET url = EXCLUDED.url, activo = EXCLUDED.activo, actualizado_en = NOW()`,
        [plataforma, config.url || null, config.activo !== false]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'update_social', 'Configuracion de redes sociales actualizada']
  ).catch(console.error);

  res.json({ success: true, message: 'Redes sociales actualizadas exitosamente' });
};

// ---- WHATSAPP ----

const getWhatsapp = async (req, res) => {
  const result = await query(
    'SELECT id, codigo_pais, numero, mensaje_predeterminado, activo FROM configuracion_whatsapp LIMIT 1',
    []
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Configuracion de WhatsApp no encontrada' });
  }

  const config = result.rows[0];
  const numero = config.codigo_pais.replace('+', '') + config.numero;
  const mensajeEncoded = encodeURIComponent(config.mensaje_predeterminado || '');
  const urlWhatsapp = `https://wa.me/${numero}?text=${mensajeEncoded}`;

  res.json({ success: true, data: { ...config, url_whatsapp: urlWhatsapp } });
};

const updateWhatsapp = async (req, res) => {
  const { codigo_pais, numero, mensaje_predeterminado, activo } = req.body;

  if (!numero) {
    return res.status(400).json({ success: false, error: 'El numero es requerido' });
  }

  const existing = await query('SELECT id FROM configuracion_whatsapp LIMIT 1', []);

  if (existing.rows.length === 0) {
    await query(
      `INSERT INTO configuracion_whatsapp (codigo_pais, numero, mensaje_predeterminado, activo)
       VALUES ($1, $2, $3, $4)`,
      [codigo_pais || '+57', numero, mensaje_predeterminado || null, activo !== false]
    );
  } else {
    await query(
      `UPDATE configuracion_whatsapp
       SET codigo_pais = $1, numero = $2, mensaje_predeterminado = $3, activo = $4, actualizado_en = NOW()
       WHERE id = $5`,
      [codigo_pais || '+57', numero, mensaje_predeterminado || null, activo !== false, existing.rows[0].id]
    );
  }

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'update_whatsapp', 'Configuracion de WhatsApp actualizada']
  ).catch(console.error);

  res.json({ success: true, message: 'WhatsApp actualizado exitosamente' });
};

// ---- CONTRASENA ----

const changePassword = async (req, res) => {
  const { password_actual, password_nueva, password_nueva_confirmacion } = req.body;

  if (!password_actual || !password_nueva || !password_nueva_confirmacion) {
    return res.status(400).json({ success: false, error: 'Todos los campos son requeridos' });
  }

  if (password_nueva !== password_nueva_confirmacion) {
    return res.status(400).json({ success: false, error: 'Las contrasenas nuevas no coinciden' });
  }

  if (password_nueva.length < 8) {
    return res.status(400).json({ success: false, error: 'La contrasena debe tener al menos 8 caracteres' });
  }

  const result = await query(
    'SELECT id, password_hash FROM usuarios_admin WHERE id = $1',
    [req.user.id]
  );

  const usuario = result.rows[0];
  if (!usuario) {
    return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
  }

  const passwordValido = await bcrypt.compare(password_actual, usuario.password_hash);
  if (!passwordValido) {
    return res.status(400).json({ success: false, error: 'La contrasena actual es incorrecta' });
  }

  const nuevoHash = await bcrypt.hash(password_nueva, 10);

  await query(
    'UPDATE usuarios_admin SET password_hash = $1, actualizado_en = NOW() WHERE id = $2',
    [nuevoHash, req.user.id]
  );

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'change_password', 'Contrasena actualizada']
  ).catch(console.error);

  res.json({ success: true, message: 'Contrasena actualizada exitosamente' });
};

// ---- LOGS ----

const getLogs = async (req, res) => {
  const { page = 1, limit = 50, fecha_desde, fecha_hasta } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];
  let paramCount = 1;

  if (fecha_desde) {
    conditions.push(`l.creado_en >= $${paramCount++}`);
    params.push(fecha_desde);
  }

  if (fecha_hasta) {
    conditions.push(`l.creado_en <= $${paramCount++}`);
    params.push(fecha_hasta);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [dataResult, countResult] = await Promise.all([
    query(
      `SELECT l.id, l.accion, l.descripcion, l.ip_address, l.recurso_id, l.creado_en,
              u.username
       FROM logs_actividad_admin l
       LEFT JOIN usuarios_admin u ON l.usuario_id = u.id
       ${whereClause}
       ORDER BY l.creado_en DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limitNum, offset]
    ),
    query(
      `SELECT COUNT(*) AS total FROM logs_actividad_admin l ${whereClause}`,
      params
    ),
  ]);

  const total = parseInt(countResult.rows[0].total);

  res.json({
    success: true,
    data: dataResult.rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

module.exports = {
  getSocial,
  updateSocial,
  getWhatsapp,
  updateWhatsapp,
  changePassword,
  getLogs,
};
