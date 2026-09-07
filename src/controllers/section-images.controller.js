const { query } = require('../config/database');

const getSectionImages = async (req, res) => {
  const result = await query(
    `SELECT pagina, clave, url_imagen
     FROM imagenes_secciones
     WHERE url_imagen IS NOT NULL`,
    []
  );

  res.json({ success: true, data: result.rows });
};

module.exports = { getSectionImages };
