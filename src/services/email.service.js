const nodemailer = require('nodemailer');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
};

const sendMail = async (options) => {
  const transport = getTransporter();
  return transport.sendMail({
    from: process.env.EMAIL_FROM || 'FUNAC <notificaciones@funac.org>',
    ...options,
  });
};

/**
 * Envia email de confirmacion al voluntario recien registrado
 */
const sendVolunteerConfirmation = async (volunteer) => {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: #1a5276; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">FUNAC</h1>
          <p style="color: #aed6f1; margin: 8px 0 0;">Fundacion de Ayuda a la Comunidad</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1a5276; margin-top: 0;">Registro de Voluntario Confirmado</h2>
          <p>Estimado/a <strong>${volunteer.nombre_completo}</strong>,</p>
          <p>Hemos recibido tu solicitud para ser parte de nuestro equipo de voluntarios. Nos alegra mucho contar con personas comprometidas como tu.</p>
          <div style="background: #eaf4fb; border-left: 4px solid #1a5276; padding: 16px; margin: 24px 0; border-radius: 4px;">
            <p style="margin: 0;"><strong>Datos de tu registro:</strong></p>
            <ul style="margin: 8px 0 0; padding-left: 20px;">
              <li>Nombre: ${volunteer.nombre_completo}</li>
              <li>Cedula: ${volunteer.cedula}</li>
              <li>Email: ${volunteer.email}</li>
              <li>Ciudad: ${volunteer.ciudad}</li>
            </ul>
          </div>
          <p>Nuestro equipo revisara tu solicitud y se pondra en contacto contigo pronto.</p>
          <p style="color: #666;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
        </div>
        <div style="background: #f8f9fa; padding: 16px; text-align: center; color: #888; font-size: 12px;">
          <p style="margin: 0;">FUNAC &copy; ${new Date().getFullYear()} | Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendMail({
    to: volunteer.email,
    subject: 'Confirmacion de registro como voluntario - FUNAC',
    html,
  });
};

/**
 * Envia confirmacion al usuario que envio formulario de contacto
 */
const sendContactConfirmation = async (contact) => {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: #1a5276; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">FUNAC</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1a5276; margin-top: 0;">Hemos recibido tu mensaje</h2>
          <p>Hola <strong>${contact.nombre_completo}</strong>,</p>
          <p>Gracias por comunicarte con nosotros. Hemos recibido tu mensaje con el asunto: <strong>"${contact.asunto}"</strong>.</p>
          <p>Nuestro equipo lo revisara y te responderemos a la mayor brevedad posible.</p>
          <p style="color: #666; font-size: 14px;">Este es un mensaje automatico, por favor no respondas a este correo.</p>
        </div>
        <div style="background: #f8f9fa; padding: 16px; text-align: center; color: #888; font-size: 12px;">
          <p style="margin: 0;">FUNAC &copy; ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendMail({
    to: contact.email,
    subject: 'Hemos recibido tu mensaje - FUNAC',
    html,
  });
};

/**
 * Envia notificacion al admin sobre evento importante
 * @param {string} type - 'volunteer' | 'contact' | 'donation'
 * @param {object} data
 */
const sendAdminNotification = async (type, data) => {
  const adminEmail = process.env.EMAIL_ADMIN;
  if (!adminEmail) return;

  const subjects = {
    volunteer: 'Nuevo registro de voluntario',
    contact: 'Nuevo mensaje de contacto',
    donation: 'Nueva donacion recibida',
  };

  let bodyHtml = '';

  if (type === 'volunteer') {
    bodyHtml = `
      <h3>Nuevo voluntario registrado</h3>
      <ul>
        <li><strong>Nombre:</strong> ${data.nombre_completo}</li>
        <li><strong>Cedula:</strong> ${data.cedula}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Telefono:</strong> ${data.telefono}</li>
        <li><strong>Ciudad:</strong> ${data.ciudad}</li>
      </ul>
    `;
  } else if (type === 'contact') {
    bodyHtml = `
      <h3>Nuevo mensaje de contacto</h3>
      <ul>
        <li><strong>Nombre:</strong> ${data.nombre_completo}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Asunto:</strong> ${data.asunto}</li>
      </ul>
      <p><strong>Mensaje:</strong></p>
      <p style="background: #f4f4f4; padding: 12px; border-radius: 4px;">${data.mensaje}</p>
    `;
  } else if (type === 'donation') {
    bodyHtml = `
      <h3>Nueva donacion</h3>
      <ul>
        <li><strong>Donante:</strong> ${data.nombre_completo}</li>
        <li><strong>Email:</strong> ${data.email}</li>
        <li><strong>Monto:</strong> ${data.moneda} ${data.monto}</li>
        <li><strong>Referencia:</strong> ${data.referencia_epayco}</li>
      </ul>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; padding: 24px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a5276;">Notificacion FUNAC</h2>
        ${bodyHtml}
        <hr>
        <p style="color: #888; font-size: 12px;">Sistema de notificaciones FUNAC - ${new Date().toLocaleString('es-CO')}</p>
      </div>
    </body>
    </html>
  `;

  await sendMail({
    to: adminEmail,
    subject: `[FUNAC] ${subjects[type] || 'Notificacion del sistema'}`,
    html,
  });
};

/**
 * Envia comprobante de donacion exitosa al donante
 */
const sendDonationReceipt = async (donation) => {
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: #1a5276; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">FUNAC</h1>
          <p style="color: #aed6f1; margin: 8px 0 0;">Comprobante de Donacion</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1a5276; margin-top: 0;">Gracias por tu donacion</h2>
          <p>Estimado/a <strong>${donation.nombre_completo}</strong>,</p>
          <p>Tu donacion ha sido procesada exitosamente. Tu generosidad hace posible nuestro trabajo.</p>
          <div style="background: #eaf4fb; border: 1px solid #aed6f1; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px; color: #1a5276;">Detalle de la donacion</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #555;">Referencia:</td>
                <td style="padding: 6px 0; font-weight: bold;">${donation.referencia_epayco}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #555;">Monto:</td>
                <td style="padding: 6px 0; font-weight: bold; color: #1a5276; font-size: 18px;">${donation.moneda} $${Number(donation.monto).toLocaleString('es-CO')}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #555;">Fecha:</td>
                <td style="padding: 6px 0;">${new Date().toLocaleDateString('es-CO')}</td>
              </tr>
              ${donation.es_recurrente ? `<tr><td style="padding: 6px 0; color: #555;">Tipo:</td><td style="padding: 6px 0;">Donacion recurrente (${donation.frecuencia})</td></tr>` : ''}
            </table>
          </div>
          <p>Conserva este correo como comprobante de tu donacion.</p>
          <p>Con tu apoyo continuamos transformando vidas. <strong>Gracias</strong>.</p>
        </div>
        <div style="background: #f8f9fa; padding: 16px; text-align: center; color: #888; font-size: 12px;">
          <p style="margin: 0;">FUNAC &copy; ${new Date().getFullYear()} | Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendMail({
    to: donation.email,
    subject: `Comprobante de donacion FUNAC - ${donation.referencia_epayco}`,
    html,
  });
};

module.exports = {
  sendVolunteerConfirmation,
  sendContactConfirmation,
  sendAdminNotification,
  sendDonationReceipt,
};
