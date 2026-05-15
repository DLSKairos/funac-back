const { query } = require('../../config/database');

// GET /api/admin/noticias-modal - devuelve la config completa sin filtrar por activo
const getNewsModal = async (req, res) => {
  const result = await query(
    'SELECT id, activo, titulo, subtitulo, badge_texto, highlight_texto, url_destino, etiqueta_boton, actualizado_en FROM configuracion_modal_noticia LIMIT 1',
    []
  );

  if (result.rows.length === 0) {
    return res.json({ success: true, data: null });
  }

  res.json({ success: true, data: result.rows[0] });
};

// PUT /api/admin/noticias-modal - actualiza todos los campos
const updateNewsModal = async (req, res) => {
  const { activo, titulo, subtitulo, badge_texto, highlight_texto, url_destino, etiqueta_boton } = req.body;

  if (!titulo) {
    return res.status(400).json({ success: false, error: 'El titulo es requerido' });
  }

  if (!subtitulo) {
    return res.status(400).json({ success: false, error: 'El subtitulo es requerido' });
  }

  if (!url_destino) {
    return res.status(400).json({ success: false, error: 'La url_destino es requerida' });
  }

  if (!etiqueta_boton) {
    return res.status(400).json({ success: false, error: 'La etiqueta_boton es requerida' });
  }

  const existing = await query('SELECT id FROM configuracion_modal_noticia LIMIT 1', []);

  if (existing.rows.length === 0) {
    await query(
      `INSERT INTO configuracion_modal_noticia (activo, titulo, subtitulo, badge_texto, highlight_texto, url_destino, etiqueta_boton)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [activo !== false, titulo, subtitulo, badge_texto || null, highlight_texto || null, url_destino, etiqueta_boton]
    );
  } else {
    await query(
      `UPDATE configuracion_modal_noticia
       SET activo = $1, titulo = $2, subtitulo = $3, badge_texto = $4, highlight_texto = $5,
           url_destino = $6, etiqueta_boton = $7, actualizado_en = NOW()
       WHERE id = 1`,
      [activo !== false, titulo, subtitulo, badge_texto || null, highlight_texto || null, url_destino, etiqueta_boton]
    );
  }

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'update_news_modal', 'Modal de noticias actualizado']
  ).catch(console.error);

  res.json({ success: true, message: 'Modal de noticias actualizado exitosamente' });
};

module.exports = {
  getNewsModal,
  updateNewsModal,
};
