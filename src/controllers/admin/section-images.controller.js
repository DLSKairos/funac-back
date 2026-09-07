const { query } = require('../../config/database');
const { cloudinary } = require('../../config/cloudinary');

const listSectionImages = async (req, res) => {
  const result = await query(
    `SELECT id, pagina, clave, etiqueta, nombre_archivo, url_imagen, tamano_archivo, actualizado_en
     FROM imagenes_secciones
     ORDER BY pagina, clave`,
    []
  );
  res.json({ success: true, data: result.rows });
};

const uploadSectionImage = async (req, res) => {
  const { pagina, clave } = req.params;

  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No se envio ningun archivo' });
  }

  const existing = await query(
    'SELECT id, ruta_archivo FROM imagenes_secciones WHERE pagina = $1 AND clave = $2',
    [pagina, clave]
  );

  const slot = existing.rows[0];
  if (!slot) {
    return res.status(404).json({ success: false, error: 'Seccion no encontrada' });
  }

  if (slot.ruta_archivo) {
    await cloudinary.uploader.destroy(slot.ruta_archivo);
  }

  const result = await query(
    `UPDATE imagenes_secciones
     SET nombre_archivo = $1, url_imagen = $2, ruta_archivo = $3, tamano_archivo = $4, actualizado_en = NOW()
     WHERE pagina = $5 AND clave = $6
     RETURNING id, pagina, clave, etiqueta, nombre_archivo, url_imagen, tamano_archivo, actualizado_en`,
    [req.file.originalname, req.file.path, req.file.filename, req.file.size, pagina, clave]
  );

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'update_section_image', `Imagen actualizada: ${pagina}/${clave}`]
  ).catch(console.error);

  res.json({ success: true, data: result.rows[0], message: 'Imagen actualizada exitosamente' });
};

const resetSectionImage = async (req, res) => {
  const { pagina, clave } = req.params;

  const existing = await query(
    'SELECT id, ruta_archivo FROM imagenes_secciones WHERE pagina = $1 AND clave = $2',
    [pagina, clave]
  );

  const slot = existing.rows[0];
  if (!slot) {
    return res.status(404).json({ success: false, error: 'Seccion no encontrada' });
  }

  if (slot.ruta_archivo) {
    await cloudinary.uploader.destroy(slot.ruta_archivo);
  }

  const result = await query(
    `UPDATE imagenes_secciones
     SET nombre_archivo = NULL, url_imagen = NULL, ruta_archivo = NULL, tamano_archivo = NULL, actualizado_en = NOW()
     WHERE pagina = $1 AND clave = $2
     RETURNING id, pagina, clave, etiqueta, nombre_archivo, url_imagen, tamano_archivo, actualizado_en`,
    [pagina, clave]
  );

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'reset_section_image', `Imagen restablecida: ${pagina}/${clave}`]
  ).catch(console.error);

  res.json({ success: true, data: result.rows[0], message: 'Imagen restablecida exitosamente' });
};

module.exports = {
  listSectionImages,
  uploadSectionImage,
  resetSectionImage,
};
