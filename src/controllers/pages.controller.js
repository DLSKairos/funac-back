const { query } = require('../config/database');

const VALID_PAGES = ['quienes_somos', 'valores', 'mision_vision', 'contacto'];

const getPage = async (req, res) => {
  const pagina = req.params.pagina.replace(/-/g, '_');

  if (!VALID_PAGES.includes(pagina)) {
    return res.status(404).json({ success: false, error: 'Pagina no encontrada' });
  }

  const result = await query(
    `SELECT id, seccion, contenido, orden
     FROM contenido_paginas
     WHERE pagina = $1 AND activo = TRUE
     ORDER BY orden ASC`,
    [pagina]
  );

  res.json({ success: true, data: result.rows });
};

const getSettings = async (req, res) => {
  const socialResult = await query(
    'SELECT plataforma, url, activo FROM configuracion_redes_sociales ORDER BY plataforma ASC',
    []
  );

  const social = {};
  for (const row of socialResult.rows) {
    social[row.plataforma] = { url: row.url, activo: row.activo };
  }

  res.json({ success: true, data: social });
};

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

  res.json({
    success: true,
    data: {
      ...config,
      url_whatsapp: urlWhatsapp,
    },
  });
};

module.exports = { getPage, getSettings, getWhatsapp };
