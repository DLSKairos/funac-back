const Joi = require('joi');
const { query } = require('../config/database');
const emailService = require('../services/email.service');

const contactSchema = Joi.object({
  nombre_completo: Joi.string().min(2).max(150).required().messages({
    'any.required': 'El nombre completo es requerido',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'El email es requerido',
    'string.email': 'El email no es valido',
  }),
  telefono: Joi.string().min(7).max(20).optional().allow('', null),
  asunto: Joi.string().min(3).max(200).required().messages({
    'any.required': 'El asunto es requerido',
  }),
  mensaje: Joi.string().min(10).max(2000).required().messages({
    'any.required': 'El mensaje es requerido',
    'string.min': 'El mensaje debe tener al menos 10 caracteres',
  }),
});

const sendContact = async (req, res) => {
  const { error, value } = contactSchema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }

  const result = await query(
    `INSERT INTO formularios_contacto (nombre_completo, email, telefono, asunto, mensaje)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nombre_completo, email, asunto, creado_en`,
    [value.nombre_completo, value.email, value.telefono || null, value.asunto, value.mensaje]
  );

  const contacto = result.rows[0];

  // Enviar emails sin bloquear la respuesta
  Promise.all([
    emailService.sendContactConfirmation({ ...contacto, ...value }).catch(console.error),
    emailService.sendAdminNotification('contact', value).catch(console.error),
  ]);

  res.status(201).json({
    success: true,
    data: { id: contacto.id, creado_en: contacto.creado_en },
    message: 'Mensaje enviado exitosamente. Te responderemos pronto.',
  });
};

module.exports = { sendContact };
