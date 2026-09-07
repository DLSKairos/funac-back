const { query } = require('../../config/database');
const { cloudinary } = require('../../config/cloudinary');

// GET /api/admin/noticias-modal - devuelve la config completa sin filtrar por activo
const getNewsModal = async (req, res) => {
  const result = await query(
    'SELECT id, activo, titulo, subtitulo, badge_texto, highlight_texto, url_destino, etiqueta_boton, imagen_url, actualizado_en FROM configuracion_modal_noticia LIMIT 1',
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

// POST /api/admin/noticias-modal/imagen - sube o reemplaza la imagen del modal
const uploadNewsModalImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No se envio ningun archivo' });
  }

  const existing = await query('SELECT id, imagen_public_id FROM configuracion_modal_noticia LIMIT 1', []);
  const config = existing.rows[0];

  if (!config) {
    return res.status(400).json({ success: false, error: 'Debe guardar la configuracion del modal antes de subir una imagen' });
  }

  if (config.imagen_public_id) {
    await cloudinary.uploader.destroy(config.imagen_public_id);
  }

  const result = await query(
    `UPDATE configuracion_modal_noticia
     SET imagen_url = $1, imagen_public_id = $2, actualizado_en = NOW()
     WHERE id = $3
     RETURNING id, activo, titulo, subtitulo, badge_texto, highlight_texto, url_destino, etiqueta_boton, imagen_url, actualizado_en`,
    [req.file.path, req.file.filename, config.id]
  );

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'update_news_modal_image', 'Imagen del modal de noticias actualizada']
  ).catch(console.error);

  res.json({ success: true, data: result.rows[0], message: 'Imagen actualizada exitosamente' });
};

// DELETE /api/admin/noticias-modal/imagen - quita la imagen del modal
const deleteNewsModalImage = async (req, res) => {
  const existing = await query('SELECT id, imagen_public_id FROM configuracion_modal_noticia LIMIT 1', []);
  const config = existing.rows[0];

  if (!config) {
    return res.status(404).json({ success: false, error: 'Configuracion no encontrada' });
  }

  if (config.imagen_public_id) {
    await cloudinary.uploader.destroy(config.imagen_public_id);
  }

  const result = await query(
    `UPDATE configuracion_modal_noticia
     SET imagen_url = NULL, imagen_public_id = NULL, actualizado_en = NOW()
     WHERE id = $1
     RETURNING id, activo, titulo, subtitulo, badge_texto, highlight_texto, url_destino, etiqueta_boton, imagen_url, actualizado_en`,
    [config.id]
  );

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'delete_news_modal_image', 'Imagen del modal de noticias eliminada']
  ).catch(console.error);

  res.json({ success: true, data: result.rows[0], message: 'Imagen eliminada exitosamente' });
};

module.exports = {
  getNewsModal,
  updateNewsModal,
  uploadNewsModalImage,
  deleteNewsModalImage,
};
