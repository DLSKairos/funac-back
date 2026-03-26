/**
 * Servicio de ePayco - Stub para integracion de pagos
 *
 * TODO: Cuando se tengan las credenciales de ePayco, completar esta integracion.
 * Documentacion oficial: https://docs.epayco.co/
 *
 * Para la integracion real se necesita:
 * - EPAYCO_PUBLIC_KEY
 * - EPAYCO_PRIVATE_KEY
 * - EPAYCO_CUSTOMER_ID
 * - EPAYCO_TEST_MODE (true/false)
 *
 * La libreria oficial de ePayco para Node.js puede no estar disponible en npm
 * con un nombre estandar. Verificar disponibilidad en:
 * https://www.npmjs.com/search?q=epayco
 * o usar la API REST directamente:
 * https://api.secure.payco.co/
 */

/**
 * Estructura esperada de respuesta del checkout
 * @typedef {Object} EpaycoCheckoutResponse
 * @property {string} checkout_url - URL para redirigir al usuario al pago
 * @property {string} ref_payco - Referencia interna de ePayco
 * @property {boolean} test - Indica si es modo prueba
 */

/**
 * Estructura esperada del webhook de ePayco
 * @typedef {Object} EpaycoWebhookData
 * @property {string} x_ref_payco - Referencia de ePayco
 * @property {string} x_transaction_id - ID de transaccion
 * @property {string} x_transaction_state - Estado: 'Aceptada'|'Rechazada'|'Pendiente'|'Fallida'
 * @property {string} x_amount - Monto cobrado
 * @property {string} x_currency_code - Moneda
 * @property {string} x_extra1 - Campo extra (usado para referencia interna)
 * @property {string} x_signature - Firma para validacion
 */

/**
 * Mapeo de estados de ePayco a estados internos
 */
const ESTADO_MAP = {
  Aceptada: 'completada',
  Rechazada: 'fallida',
  Pendiente: 'pendiente',
  Fallida: 'fallida',
  Cancelada: 'cancelada',
};

/**
 * Inicializa el checkout de ePayco para una donacion
 * @param {object} donacion - Datos de la donacion
 * @param {string} donacion.referencia - Referencia interna FUNAC
 * @param {number} donacion.monto - Monto en la moneda indicada
 * @param {string} donacion.moneda - 'COP' | 'USD'
 * @param {string} donacion.nombre_completo - Nombre del donante
 * @param {string} donacion.email - Email del donante
 * @param {string} donacion.telefono - Telefono del donante
 * @param {string} donacion.descripcion - Descripcion del cobro
 * @returns {Promise<EpaycoCheckoutResponse>}
 */
const initCheckout = async (donacion) => {
  // TODO: Implementar con SDK o API REST de ePayco cuando se tengan credenciales
  //
  // Ejemplo con API REST directa:
  // const response = await fetch('https://api.secure.payco.co/payment/process', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${EPAYCO_PRIVATE_KEY}`,
  //   },
  //   body: JSON.stringify({
  //     public_key: process.env.EPAYCO_PUBLIC_KEY,
  //     amount: donacion.monto,
  //     tax: '0',
  //     tax_base: donacion.monto,
  //     currency: donacion.moneda,
  //     name: 'Donacion FUNAC',
  //     description: donacion.descripcion || 'Donacion a FUNAC',
  //     invoice: donacion.referencia,
  //     email: donacion.email,
  //     name_billing: donacion.nombre_completo,
  //     type_doc_billing: 'cc',
  //     mobilephone_billing: donacion.telefono,
  //     url_response: `${process.env.API_URL}/api/donations/webhook`,
  //     url_confirmation: `${process.env.API_URL}/api/donations/webhook`,
  //     extra1: donacion.referencia,
  //     test: process.env.EPAYCO_TEST_MODE === 'true' ? '1' : '0',
  //   }),
  // });
  // const data = await response.json();
  // return {
  //   checkout_url: data.data?.urlbanco || data.data?.routechangeDefaultPayment,
  //   ref_payco: data.data?.ref_payco,
  //   test: process.env.EPAYCO_TEST_MODE === 'true',
  // };

  const isTest = process.env.EPAYCO_TEST_MODE !== 'false';
  const checkoutUrl = `https://checkout.epayco.co/payment/${process.env.EPAYCO_PUBLIC_KEY || 'TEST_KEY'}`;

  return {
    checkout_url: `${checkoutUrl}?ref=${donacion.referencia}&amount=${donacion.monto}&currency=${donacion.moneda}`,
    ref_payco: `TEST_${Date.now()}`,
    test: isTest,
  };
};

/**
 * Verifica la firma del webhook de ePayco para prevenir fraude
 * @param {object} webhookData - Datos recibidos del webhook
 * @returns {boolean}
 */
const verifyWebhookSignature = (webhookData) => {
  // TODO: Implementar verificacion de firma real con ePayco
  //
  // Segun documentacion de ePayco, la firma se calcula asi:
  // const crypto = require('crypto');
  // const signatureStr = `${process.env.EPAYCO_CUSTOMER_ID}^${process.env.EPAYCO_PUBLIC_KEY}^${webhookData.x_ref_payco}^${webhookData.x_transaction_id}^${webhookData.x_amount}^${webhookData.x_currency_code}`;
  // const expectedSignature = crypto.createHash('sha256').update(signatureStr).digest('hex');
  // return expectedSignature === webhookData.x_signature;

  // En modo test o sin credenciales, aceptar todos los webhooks
  if (process.env.EPAYCO_TEST_MODE === 'true' || !process.env.EPAYCO_CUSTOMER_ID) {
    return true;
  }

  return true; // TODO: reemplazar con verificacion real
};

/**
 * Obtiene el estado interno mapeado desde el estado de ePayco
 * @param {string} epaycoState - Estado devuelto por ePayco
 * @returns {string}
 */
const mapEstado = (epaycoState) => {
  return ESTADO_MAP[epaycoState] || 'pendiente';
};

/**
 * Consulta el estado de una transaccion en ePayco por referencia
 * @param {string} refPayco - Referencia de ePayco
 * @returns {Promise<object>}
 */
const getTransactionStatus = async (refPayco) => {
  // TODO: Implementar consulta real a API de ePayco
  // GET https://api.secure.payco.co/validation/v1/reference/{ref_payco}
  // con Authorization: Bearer {EPAYCO_PRIVATE_KEY}

  return {
    ref_payco: refPayco,
    estado: 'pendiente',
    mensaje: 'Consulta de estado no implementada (modo stub)',
  };
};

module.exports = {
  initCheckout,
  verifyWebhookSignature,
  mapEstado,
  getTransactionStatus,
  ESTADO_MAP,
};
