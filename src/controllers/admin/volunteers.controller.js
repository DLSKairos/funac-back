const path = require('path');
const fs = require('fs');
const { query } = require('../../config/database');
const { calcularEdad } = require('../../utils/helpers');

const ESTADOS_VALIDOS = ['pendiente', 'en_revision', 'aprobado', 'rechazado', 'inactivo'];

const listVolunteers = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    estado,
    search,
    fecha_desde,
    fecha_hasta,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];
  let paramCount = 1;

  if (estado && ESTADOS_VALIDOS.includes(estado)) {
    conditions.push(`estado = $${paramCount++}`);
    params.push(estado);
  }

  if (search) {
    conditions.push(`(nombre_completo ILIKE $${paramCount} OR email ILIKE $${paramCount} OR cedula ILIKE $${paramCount} OR ciudad ILIKE $${paramCount})`);
    params.push(`%${search}%`);
    paramCount++;
  }

  if (fecha_desde) {
    conditions.push(`creado_en >= $${paramCount++}`);
    params.push(fecha_desde);
  }

  if (fecha_hasta) {
    conditions.push(`creado_en <= $${paramCount++}`);
    params.push(fecha_hasta);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [dataResult, countResult] = await Promise.all([
    query(
      `SELECT id, nombre_completo, cedula, email, telefono, ciudad, estado,
              fecha_nacimiento, nivel_estudios, profesion_ocupacion,
              nombre_archivo_cv, url_cv, creado_en
       FROM voluntarios
       ${whereClause}
       ORDER BY creado_en DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limitNum, offset]
    ),
    query(
      `SELECT COUNT(*) AS total FROM voluntarios ${whereClause}`,
      params
    ),
  ]);

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limitNum);

  const voluntarios = dataResult.rows.map((v) => ({
    ...v,
    edad: calcularEdad(v.fecha_nacimiento),
  }));

  res.json({
    success: true,
    data: voluntarios,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
  });
};

const getVolunteer = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT id, nombre_completo, cedula, email, telefono, ciudad, direccion,
            fecha_nacimiento, nivel_estudios, profesion_ocupacion, habilidades_especiales,
            disponibilidad_horaria, motivacion, areas_interes, estado, notas_admin,
            nombre_archivo_cv, ruta_archivo_cv, url_cv, creado_en, actualizado_en
     FROM voluntarios
     WHERE id = $1`,
    [id]
  );

  const voluntario = result.rows[0];
  if (!voluntario) {
    return res.status(404).json({ success: false, error: 'Voluntario no encontrado' });
  }

  res.json({
    success: true,
    data: {
      ...voluntario,
      edad: calcularEdad(voluntario.fecha_nacimiento),
    },
  });
};

const downloadVolunteerCV = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    'SELECT id, nombre_completo, nombre_archivo_cv, ruta_archivo_cv FROM voluntarios WHERE id = $1',
    [id]
  );

  const voluntario = result.rows[0];
  if (!voluntario) {
    return res.status(404).json({ success: false, error: 'Voluntario no encontrado' });
  }

  if (!voluntario.ruta_archivo_cv) {
    return res.status(404).json({ success: false, error: 'Este voluntario no tiene CV registrado' });
  }

  const filePath = path.resolve(process.cwd(), voluntario.ruta_archivo_cv);
  res.download(filePath, voluntario.nombre_archivo_cv || 'cv.pdf', (err) => {
    if (err && !res.headersSent) {
      res.status(404).json({ success: false, error: 'Archivo no encontrado en el servidor' });
    }
  });
};

const updateVolunteerStatus = async (req, res) => {
  const { id } = req.params;
  const { estado, notas_admin } = req.body;

  if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({
      success: false,
      error: `Estado invalido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`,
    });
  }

  const result = await query(
    `UPDATE voluntarios
     SET estado = $1, notas_admin = $2, actualizado_en = NOW()
     WHERE id = $3
     RETURNING id, nombre_completo, estado, notas_admin, actualizado_en`,
    [estado, notas_admin || null, id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Voluntario no encontrado' });
  }

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion, recurso_id) VALUES ($1, $2, $3, $4)",
    [req.user.id, 'update_volunteer_status', `Estado cambiado a '${estado}' para voluntario ID ${id}`, id]
  ).catch(console.error);

  res.json({
    success: true,
    data: result.rows[0],
    message: 'Estado del voluntario actualizado',
  });
};

const deleteVolunteer = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    'SELECT id, nombre_completo, ruta_archivo_cv FROM voluntarios WHERE id = $1',
    [id]
  );

  const voluntario = result.rows[0];
  if (!voluntario) {
    return res.status(404).json({ success: false, error: 'Voluntario no encontrado' });
  }

  // Eliminar CV si existe
  if (voluntario.ruta_archivo_cv) {
    const filePath = path.resolve(process.cwd(), voluntario.ruta_archivo_cv);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  await query('DELETE FROM voluntarios WHERE id = $1', [id]);

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'delete_volunteer', `Voluntario eliminado: ${voluntario.nombre_completo} (ID: ${id})`]
  ).catch(console.error);

  res.json({ success: true, message: 'Voluntario eliminado exitosamente' });
};

module.exports = {
  listVolunteers,
  getVolunteer,
  downloadVolunteerCV,
  updateVolunteerStatus,
  deleteVolunteer,
};
