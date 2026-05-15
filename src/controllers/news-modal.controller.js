const { query } = require('../config/database');

// GET /api/noticias-modal - público, no requiere auth
const getNewsModal = async (req, res) => {
  const result = await query(
    'SELECT id, activo, titulo, subtitulo, badge_texto, highlight_texto, url_destino, etiqueta_boton, actualizado_en FROM configuracion_modal_noticia LIMIT 1',
    []
  );

  if (result.rows.length === 0) {
    return res.json({ success: true, data: null });
  }

  const config = result.rows[0];

  if (!config.activo) {
    return res.json({ success: true, data: null });
  }

  res.json({ success: true, data: config });
};

module.exports = {
  getNewsModal,
};
