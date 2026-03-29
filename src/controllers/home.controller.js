const https = require('https');
const http = require('http');
const { query } = require('../config/database');

const getImages = async (req, res) => {
  const result = await query(
    `SELECT id, titulo, descripcion, url_imagen, nombre_archivo, orden, activo, subido_en
     FROM imagenes_carrusel
     WHERE activo = TRUE
     ORDER BY orden ASC`,
    []
  );

  res.json({ success: true, data: result.rows });
};

const getPdfs = async (req, res) => {
  const result = await query(
    `SELECT id, titulo, descripcion, nombre_archivo, url_pdf, tamano_archivo, descargas, subido_en
     FROM pdfs_informativos
     WHERE activo = TRUE
     ORDER BY subido_en DESC`,
    []
  );

  res.json({ success: true, data: result.rows });
};

const downloadPdf = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    'SELECT id, titulo, nombre_archivo, url_pdf FROM pdfs_informativos WHERE id = $1 AND activo = TRUE',
    [id]
  );

  const pdf = result.rows[0];

  if (!pdf) {
    return res.status(404).json({ success: false, error: 'PDF no encontrado' });
  }

  // Incrementar contador de descargas (fire and forget)
  query('UPDATE pdfs_informativos SET descargas = descargas + 1 WHERE id = $1', [id]).catch(console.error);

  const filename = `${pdf.titulo}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);

  const client = pdf.url_pdf.startsWith('https') ? https : http;
  client.get(pdf.url_pdf, (stream) => {
    stream.pipe(res);
  }).on('error', () => {
    if (!res.headersSent) res.status(500).json({ success: false, error: 'Error al descargar el archivo' });
  });
};

module.exports = { getImages, getPdfs, downloadPdf };
