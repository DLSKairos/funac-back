const Joi = require('joi');
const path = require('path');
const { query } = require('../config/database');
const emailService = require('../services/email.service');
const { buildFileUrl } = require('../utils/helpers');

const volunteerSchema = Joi.object({
  nombre_completo: Joi.string().min(2).max(150).required().messages({
    'any.required': 'El nombre completo es requerido',
    'string.min': 'El nombre debe tener al menos 2 caracteres',
  }),
  cedula: Joi.string().min(5).max(20).required().messages({
    'any.required': 'La cedula es requerida',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'El email es requerido',
    'string.email': 'El email no es valido',
  }),
  telefono: Joi.string().min(7).max(20).required().messages({
    'any.required': 'El telefono es requerido',
  }),
  ciudad: Joi.string().min(2).max(100).required().messages({
    'any.required': 'La ciudad es requerida',
  }),
  direccion: Joi.string().max(250).optional().allow('', null),
  fecha_nacimiento: Joi.date().optional().allow(null),
  nivel_estudios: Joi.string().max(100).optional().allow('', null),
  profesion_ocupacion: Joi.string().max(150).optional().allow('', null),
  habilidades_especiales: Joi.string().max(500).optional().allow('', null),
  disponibilidad_horaria: Joi.string().max(100).optional().allow('', null),
  motivacion: Joi.string().max(1000).optional().allow('', null),
  areas_interes: Joi.array().items(Joi.string()).optional().allow(null),
});

const registerVolunteer = async (req, res) => {
  const { error, value } = volunteerSchema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }

  // Verificar que el email no este registrado
  const existing = await query('SELECT id FROM voluntarios WHERE email = $1', [value.email]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ success: false, error: 'Este email ya esta registrado como voluntario' });
  }

  // Verificar cedula duplicada
  const existingCedula = await query('SELECT id FROM voluntarios WHERE cedula = $1', [value.cedula]);
  if (existingCedula.rows.length > 0) {
    return res.status(409).json({ success: false, error: 'Esta cedula ya esta registrada' });
  }

  const result = await query(
    `INSERT INTO voluntarios
      (nombre_completo, cedula, email, telefono, ciudad, direccion, fecha_nacimiento,
       nivel_estudios, profesion_ocupacion, habilidades_especiales, disponibilidad_horaria,
       motivacion, areas_interes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
     RETURNING id, nombre_completo, cedula, email, telefono, ciudad, estado, creado_en`,
    [
      value.nombre_completo,
      value.cedula,
      value.email,
      value.telefono,
      value.ciudad,
      value.direccion || null,
      value.fecha_nacimiento || null,
      value.nivel_estudios || null,
      value.profesion_ocupacion || null,
      value.habilidades_especiales || null,
      value.disponibilidad_horaria || null,
      value.motivacion || null,
      value.areas_interes ? JSON.stringify(value.areas_interes) : null,
    ]
  );

  const voluntario = result.rows[0];

  // Enviar emails sin bloquear la respuesta
  Promise.all([
    emailService.sendVolunteerConfirmation(voluntario).catch(console.error),
    emailService.sendAdminNotification('volunteer', voluntario).catch(console.error),
  ]);

  res.status(201).json({
    success: true,
    data: voluntario,
    message: 'Registro de voluntario exitoso. Pronto nos pondremos en contacto contigo.',
  });
};

const uploadCV = async (req, res) => {
  const { id } = req.params;

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No se envio ningun archivo' });
  }

  const voluntario = await query('SELECT id, nombre_completo, email FROM voluntarios WHERE id = $1', [id]);
  if (voluntario.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Voluntario no encontrado' });
  }

  const filename = req.file.filename;
  const rutaArchivo = path.join('uploads', 'cvs', filename);
  const urlCv = buildFileUrl('cvs', filename);

  await query(
    'UPDATE voluntarios SET nombre_archivo_cv = $1, ruta_archivo_cv = $2, url_cv = $3 WHERE id = $4',
    [req.file.originalname, rutaArchivo, urlCv, id]
  );

  res.json({
    success: true,
    data: {
      nombre_archivo: req.file.originalname,
      nombre_almacenado: filename,
      ruta: rutaArchivo,
      url: urlCv,
      tamano: req.file.size,
    },
    message: 'CV subido exitosamente',
  });
};

module.exports = { registerVolunteer, uploadCV };
