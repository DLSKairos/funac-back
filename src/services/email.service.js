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

const AREAS_INTERES_LABELS = {
  construccion: 'Construccion',
  educacion: 'Educacion',
  salud: 'Salud',
  recaudacion: 'Recaudacion',
  capacitacion: 'Capacitacion',
  comunicaciones: 'Comunicaciones',
  juridico: 'Juridico',
  administrativo: 'Administrativo',
};

const formatAreasInteres = (areas) => {
  if (!areas) return '';
  const list = Array.isArray(areas) ? areas : JSON.parse(areas);
  return list.map((a) => AREAS_INTERES_LABELS[a] || a).join(', ');
};

const summaryRow = (label, value) =>
  value ? `<tr><td style="padding: 6px 0; color: #555; vertical-align: top; white-space: nowrap; padding-right: 12px;">${label}:</td><td style="padding: 6px 0;">${value}</td></tr>` : '';

/**
 * Envia al correo de notificacion de voluntariado el resumen completo de una
 * postulacion junto con la hoja de vida adjunta (PDF), una vez que el CV fue subido.
 */
const sendVolunteerApplicationSummary = async (volunteer, cvPath) => {
  const notificationEmail = process.env.VOLUNTEER_NOTIFICATION_EMAIL;
  if (!notificationEmail) {
    console.warn('VOLUNTEER_NOTIFICATION_EMAIL no esta configurado: no se envio el resumen de la postulacion');
    return;
  }
  const fromEmail = process.env.VOLUNTEER_FROM_EMAIL;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: #1a5276; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">FUNAC</h1>
          <p style="color: #aed6f1; margin: 8px 0 0;">Nueva postulacion de voluntariado</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1a5276; margin-top: 0;">${volunteer.nombre_completo}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${summaryRow('Cedula', volunteer.cedula)}
            ${summaryRow('Email', volunteer.email)}
            ${summaryRow('Telefono', volunteer.telefono)}
            ${summaryRow('Ciudad', volunteer.ciudad)}
            ${summaryRow('Direccion', volunteer.direccion)}
            ${summaryRow('Nivel de estudios', volunteer.nivel_estudios)}
            ${summaryRow('Profesion / ocupacion', volunteer.profesion_ocupacion)}
            ${summaryRow('Disponibilidad', volunteer.disponibilidad_horaria)}
            ${summaryRow('Areas de interes', formatAreasInteres(volunteer.areas_interes))}
            ${summaryRow('Habilidades especiales', volunteer.habilidades_especiales)}
            ${summaryRow('Motivacion', volunteer.motivacion)}
          </table>
          <p style="color: #666; margin-top: 24px;">Se adjunta la hoja de vida enviada por el postulante.</p>
        </div>
        <div style="background: #f8f9fa; padding: 16px; text-align: center; color: #888; font-size: 12px;">
          <p style="margin: 0;">FUNAC &copy; ${new Date().getFullYear()} | Sistema de notificaciones</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendMail({
    ...(fromEmail ? { from: `FUNAC Voluntariado <${fromEmail}>` } : {}),
    to: notificationEmail,
    subject: `Nueva postulacion de voluntariado: ${volunteer.nombre_completo}`,
    html,
    attachments: cvPath
      ? [{ filename: volunteer.nombre_archivo_cv || 'hoja-de-vida.pdf', path: cvPath }]
      : [],
  });
};

const ESTADO_INFO = {
  pendiente: {
    subject: 'Tu postulacion esta pendiente de revision',
    message: 'Tu postulacion ha sido registrada y esta pendiente de revision por nuestro equipo.',
  },
  en_revision: {
    subject: 'Tu postulacion esta en revision',
    message: 'Nuestro equipo esta revisando tu postulacion. Te contactaremos pronto con una respuesta.',
  },
  aprobado: {
    subject: 'Tu postulacion como voluntario fue aprobada',
    message: 'Felicidades, tu postulacion ha sido aprobada. Pronto nos pondremos en contacto contigo para contarte los siguientes pasos.',
  },
  rechazado: {
    subject: 'Actualizacion sobre tu postulacion como voluntario',
    message: 'Gracias por tu interes en ser voluntario de FUNAC. En esta ocasion no continuaremos con tu postulacion, pero te invitamos a intentarlo nuevamente en el futuro.',
  },
  inactivo: {
    subject: 'Tu estado como voluntario ha cambiado',
    message: 'Tu estado como voluntario en FUNAC ha sido marcado como inactivo.',
  },
};

/**
 * Notifica al postulante cuando el admin cambia el estado de su postulacion.
 */
const sendVolunteerStatusUpdate = async (volunteer) => {
  const info = ESTADO_INFO[volunteer.estado];
  if (!info) return;

  const fromEmail = process.env.VOLUNTEER_FROM_EMAIL;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
    <body style="font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: #1a5276; padding: 32px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">FUNAC</h1>
          <p style="color: #aed6f1; margin: 8px 0 0;">Actualizacion de tu postulacion</p>
        </div>
        <div style="padding: 32px;">
          <p>Estimado/a <strong>${volunteer.nombre_completo}</strong>,</p>
          <p>${info.message}</p>
          ${volunteer.notas_admin ? `
            <div style="background: #eaf4fb; border-left: 4px solid #1a5276; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0;"><strong>Nota de nuestro equipo:</strong></p>
              <p style="margin: 8px 0 0;">${volunteer.notas_admin}</p>
            </div>
          ` : ''}
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
    ...(fromEmail ? { from: `FUNAC Voluntariado <${fromEmail}>` } : {}),
    to: volunteer.email,
    subject: `${info.subject} - FUNAC`,
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
  sendVolunteerApplicationSummary,
  sendVolunteerStatusUpdate,
};
