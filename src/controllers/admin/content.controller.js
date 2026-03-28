const { query, getClient } = require('../../config/database');
const { cloudinary } = require('../../config/cloudinary');

// ---- CAROUSEL ----

const uploadCarouselImages = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, error: 'No se enviaron archivos' });
  }

  // Obtener el orden maximo actual
  const ordenResult = await query('SELECT COALESCE(MAX(orden), 0) AS max_orden FROM imagenes_carrusel', []);
  let nextOrden = parseInt(ordenResult.rows[0].max_orden) + 1;

  const creadas = [];

  for (const file of req.files) {
    const result = await query(
      `INSERT INTO imagenes_carrusel (titulo, nombre_archivo, url_imagen, ruta_archivo, tamano_archivo, orden)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, titulo, nombre_archivo, url_imagen, orden, activo, subido_en`,
      [
        file.originalname.replace(/\.[^/.]+$/, ''),
        file.originalname,
        file.path,       // Cloudinary URL
        file.filename,   // Cloudinary public_id for deletion
        file.size,
        nextOrden++,
      ]
    );

    creadas.push(result.rows[0]);
  }

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'upload_carousel', `Se subieron ${creadas.length} imagen(es) al carrusel`]
  ).catch(console.error);

  res.status(201).json({
    success: true,
    data: creadas,
    message: `${creadas.length} imagen(es) subida(s) exitosamente`,
  });
};

const reorderCarouselImages = async (req, res) => {
  const { orden } = req.body;

  if (!Array.isArray(orden) || orden.length === 0) {
    return res.status(400).json({ success: false, error: 'Se requiere un array de orden' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    for (const item of orden) {
      if (!item.id || item.orden === undefined) continue;
      await client.query('UPDATE imagenes_carrusel SET orden = $1 WHERE id = $2', [item.orden, item.id]);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  res.json({ success: true, message: 'Orden actualizado exitosamente' });
};

const deleteCarouselImage = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    'SELECT id, nombre_archivo, ruta_archivo FROM imagenes_carrusel WHERE id = $1',
    [id]
  );

  const imagen = result.rows[0];
  if (!imagen) {
    return res.status(404).json({ success: false, error: 'Imagen no encontrada' });
  }

  // Eliminar archivo de Cloudinary usando el public_id almacenado en ruta_archivo
  await cloudinary.uploader.destroy(imagen.ruta_archivo);

  await query('DELETE FROM imagenes_carrusel WHERE id = $1', [id]);

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'delete_carousel', `Imagen eliminada: ${imagen.nombre_archivo}`]
  ).catch(console.error);

  res.json({ success: true, message: 'Imagen eliminada exitosamente' });
};

const toggleCarouselImage = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    'UPDATE imagenes_carrusel SET activo = NOT activo WHERE id = $1 RETURNING id, activo',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Imagen no encontrada' });
  }

  res.json({ success: true, data: result.rows[0] });
};

// ---- PDFS ----

const uploadPdf = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No se envio ningun archivo' });
  }

  const { titulo, descripcion } = req.body;
  if (!titulo) {
    return res.status(400).json({ success: false, error: 'El titulo es requerido' });
  }

  const result = await query(
    `INSERT INTO pdfs_informativos (titulo, descripcion, nombre_archivo, url_pdf, ruta_archivo, tamano_archivo)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, titulo, descripcion, nombre_archivo, url_pdf, tamano_archivo, descargas, activo, subido_en`,
    [
      titulo,
      descripcion || null,
      req.file.originalname,
      req.file.path,       // Cloudinary URL
      req.file.filename,   // Cloudinary public_id for deletion
      req.file.size,
    ]
  );

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'upload_pdf', `PDF subido: ${titulo}`]
  ).catch(console.error);

  res.status(201).json({
    success: true,
    data: result.rows[0],
    message: 'PDF subido exitosamente',
  });
};

const deletePdf = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    'SELECT id, titulo, ruta_archivo, nombre_archivo FROM pdfs_informativos WHERE id = $1',
    [id]
  );

  const pdf = result.rows[0];
  if (!pdf) {
    return res.status(404).json({ success: false, error: 'PDF no encontrado' });
  }

  // Eliminar archivo de Cloudinary usando el public_id almacenado en ruta_archivo
  await cloudinary.uploader.destroy(pdf.ruta_archivo, { resource_type: 'raw' });

  await query('DELETE FROM pdfs_informativos WHERE id = $1', [id]);

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'delete_pdf', `PDF eliminado: ${pdf.titulo}`]
  ).catch(console.error);

  res.json({ success: true, message: 'PDF eliminado exitosamente' });
};

const togglePdf = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    'UPDATE pdfs_informativos SET activo = NOT activo WHERE id = $1 RETURNING id, activo',
    [id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'PDF no encontrado' });
  }

  res.json({ success: true, data: result.rows[0] });
};

const listCarouselImages = async (req, res) => {
  const result = await query(
    `SELECT id, titulo, descripcion, nombre_archivo, url_imagen, orden, activo, tamano_archivo, subido_en
     FROM imagenes_carrusel
     ORDER BY orden ASC`,
    []
  );
  res.json({ success: true, data: result.rows });
};

const listPdfs = async (req, res) => {
  const result = await query(
    `SELECT id, titulo, descripcion, nombre_archivo, url_pdf, tamano_archivo, descargas, activo, subido_en
     FROM pdfs_informativos
     ORDER BY subido_en DESC`,
    []
  );
  res.json({ success: true, data: result.rows });
};

module.exports = {
  uploadCarouselImages,
  reorderCarouselImages,
  deleteCarouselImage,
  toggleCarouselImage,
  listCarouselImages,
  uploadPdf,
  deletePdf,
  togglePdf,
  listPdfs,
};
