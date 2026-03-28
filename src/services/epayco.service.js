const crypto = require('crypto');

const ESTADO_MAP = {
  Aceptada: 'completada',
  Rechazada: 'fallida',
  Pendiente: 'pendiente',
  Fallida: 'fallida',
  Cancelada: 'cancelada',
};

/**
 * Verifica la firma SHA-256 del webhook de ePayco para prevenir fraude.
 * Firma esperada: sha256(P_CUST_ID_CLIENTE^P_KEY^x_ref_payco^x_transaction_id^x_amount^x_currency_code)
 */
const verifyWebhookSignature = (webhookData) => {
  const { x_ref_payco, x_transaction_id, x_amount, x_currency_code, x_signature } = webhookData;

  // En modo test, ePayco puede no enviar firma — aceptar
  if (process.env.EPAYCO_TEST_MODE === 'true' && !x_signature) {
    return true;
  }

  if (!x_signature) return false;

  const signatureStr = [
    process.env.EPAYCO_CUSTOMER_ID,
    process.env.EPAYCO_P_KEY,
    x_ref_payco,
    x_transaction_id,
    x_amount,
    x_currency_code,
  ].join('^');

  const expectedSignature = crypto.createHash('sha256').update(signatureStr).digest('hex');

  return expectedSignature === x_signature;
};

const mapEstado = (epaycoState) => {
  return ESTADO_MAP[epaycoState] || 'pendiente';
};

module.exports = {
  verifyWebhookSignature,
  mapEstado,
  ESTADO_MAP,
};
