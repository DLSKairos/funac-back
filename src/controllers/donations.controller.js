const Joi = require('joi');
const { query } = require('../config/database');
const epaycoService = require('../services/epayco.service');
const emailService = require('../services/email.service');
const { generateReference } = require('../utils/helpers');

const donationInitSchema = Joi.object({
  nombre_completo: Joi.string().min(2).max(150).required().messages({
    'any.required': 'El nombre completo es requerido',
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'El email es requerido',
    'string.email': 'El email no es valido',
  }),
  telefono: Joi.string().min(7).max(20).optional().allow('', null),
  cedula: Joi.string().max(20).optional().allow('', null),
  monto: Joi.number().min(1000).required().messages({
    'any.required': 'El monto es requerido',
    'number.min': 'El monto minimo es 1000',
  }),
  moneda: Joi.string().valid('COP', 'USD').default('COP'),
  es_recurrente: Joi.boolean().default(false),
  frecuencia: Joi.string().valid('mensual', 'bimestral', 'trimestral', 'anual').optional().allow('', null),
  aparecer_muro_donantes: Joi.boolean().default(false),
});

const initDonation = async (req, res) => {
  const { error, value } = donationInitSchema.validate(req.body, { abortEarly: true });
  if (error) {
    return res.status(400).json({ success: false, error: error.details[0].message });
  }

  // Insertar donacion en estado pendiente para obtener el ID
  const result = await query(
    `INSERT INTO donaciones
      (nombre_completo, email, telefono, cedula, monto, moneda, es_recurrente,
       frecuencia, aparecer_muro_donantes, estado)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pendiente')
     RETURNING id, nombre_completo, email, monto, moneda, es_recurrente, frecuencia, estado, creado_en`,
    [
      value.nombre_completo,
      value.email,
      value.telefono || null,
      value.cedula || null,
      value.monto,
      value.moneda,
      value.es_recurrente,
      value.frecuencia || null,
      value.aparecer_muro_donantes,
    ]
  );

  const donacion = result.rows[0];
  const referencia = generateReference(donacion.id);

  // Obtener URL de checkout de ePayco
  const checkout = await epaycoService.initCheckout({
    referencia,
    monto: donacion.monto,
    moneda: donacion.moneda,
    nombre_completo: donacion.nombre_completo,
    email: donacion.email,
    telefono: value.telefono,
    descripcion: `Donacion FUNAC - ${referencia}`,
  });

  // Actualizar referencia en BD
  await query(
    'UPDATE donaciones SET referencia_epayco = $1 WHERE id = $2',
    [referencia, donacion.id]
  );

  res.status(201).json({
    success: true,
    data: {
      ...donacion,
      referencia_epayco: referencia,
      checkout_url: checkout.checkout_url,
      test_mode: checkout.test,
    },
    message: 'Donacion iniciada. Redirigiendo al portal de pago.',
  });
};

const handleWebhook = async (req, res) => {
  // Siempre responder 200 primero para que ePayco no reintente
  const body = req.body;

  try {
    // Verificar firma
    const firmaValida = epaycoService.verifyWebhookSignature(body);
    if (!firmaValida) {
      console.error('[Webhook] Firma invalida:', body);
      return res.status(200).json({ success: false, message: 'Firma invalida' });
    }

    const referenciaInterna = body.x_extra1 || body.x_invoice;
    const estadoEpayco = body.x_transaction_state;
    const refPayco = body.x_ref_payco;
    const transactionId = body.x_transaction_id;

    if (!referenciaInterna) {
      return res.status(200).json({ success: false, message: 'Referencia no encontrada en webhook' });
    }

    const donacionResult = await query(
      'SELECT id, estado, email, nombre_completo, monto, moneda, es_recurrente, frecuencia FROM donaciones WHERE referencia_epayco = $1',
      [referenciaInterna]
    );

    const donacion = donacionResult.rows[0];
    if (!donacion) {
      console.error('[Webhook] Donacion no encontrada para referencia:', referenciaInterna);
      return res.status(200).json({ success: false, message: 'Donacion no encontrada' });
    }

    const nuevoEstado = epaycoService.mapEstado(estadoEpayco);

    await query(
      `UPDATE donaciones
       SET estado = $1, ref_payco = $2, transaction_id = $3, fecha_pago = NOW(), actualizado_en = NOW()
       WHERE referencia_epayco = $4`,
      [nuevoEstado, refPayco || null, transactionId || null, referenciaInterna]
    );

    // Si la donacion fue completada y no se ha enviado comprobante
    if (nuevoEstado === 'completada' && !donacion.comprobante_enviado) {
      const donacionCompleta = { ...donacion, referencia_epayco: referenciaInterna };
      emailService.sendDonationReceipt(donacionCompleta).then(() => {
        query('UPDATE donaciones SET comprobante_enviado = TRUE WHERE referencia_epayco = $1', [referenciaInterna]).catch(console.error);
        emailService.sendAdminNotification('donation', donacionCompleta).catch(console.error);
      }).catch(console.error);
    }
  } catch (err) {
    console.error('[Webhook] Error procesando webhook:', err);
  }

  res.status(200).json({ success: true, message: 'Webhook procesado' });
};

const getDonationStatus = async (req, res) => {
  const { referencia } = req.params;

  const result = await query(
    `SELECT id, nombre_completo, monto, moneda, estado, referencia_epayco,
            es_recurrente, frecuencia, aparecer_muro_donantes, creado_en, fecha_pago
     FROM donaciones
     WHERE referencia_epayco = $1`,
    [referencia]
  );

  const donacion = result.rows[0];
  if (!donacion) {
    return res.status(404).json({ success: false, error: 'Donacion no encontrada' });
  }

  res.json({ success: true, data: donacion });
};

module.exports = { initDonation, handleWebhook, getDonationStatus };
