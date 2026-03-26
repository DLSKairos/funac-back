const { query } = require('../../config/database');

const getStats = async (req, res) => {
  const [volunteers, donations, contacts, carousel, pdfs] = await Promise.all([
    query(`SELECT
             COUNT(*) AS total,
             COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) AS pendientes,
             COUNT(CASE WHEN estado = 'aprobado' THEN 1 END) AS aprobados,
             COUNT(CASE WHEN estado = 'rechazado' THEN 1 END) AS rechazados,
             COUNT(CASE WHEN creado_en >= NOW() - INTERVAL '30 days' THEN 1 END) AS ultimos_30_dias
           FROM voluntarios`, []),
    query(`SELECT
             COUNT(*) AS total,
             COUNT(CASE WHEN estado = 'completada' THEN 1 END) AS completadas,
             COUNT(CASE WHEN estado = 'pendiente' THEN 1 END) AS pendientes,
             COALESCE(SUM(CASE WHEN estado = 'completada' THEN monto ELSE 0 END), 0) AS total_recaudado,
             COALESCE(SUM(CASE WHEN estado = 'completada' AND creado_en >= NOW() - INTERVAL '30 days' THEN monto ELSE 0 END), 0) AS recaudado_30_dias
           FROM donaciones`, []),
    query(`SELECT
             COUNT(*) AS total,
             COUNT(CASE WHEN leido = FALSE THEN 1 END) AS no_leidos,
             COUNT(CASE WHEN creado_en >= NOW() - INTERVAL '7 days' THEN 1 END) AS ultimos_7_dias
           FROM formularios_contacto`, []),
    query('SELECT COUNT(*) AS total FROM imagenes_carrusel WHERE activo = TRUE', []),
    query('SELECT COUNT(*) AS total, COALESCE(SUM(descargas), 0) AS total_descargas FROM pdfs_informativos WHERE activo = TRUE', []),
  ]);

  res.json({
    success: true,
    data: {
      voluntarios: volunteers.rows[0],
      donaciones: donations.rows[0],
      contactos: contacts.rows[0],
      carrusel: carousel.rows[0],
      pdfs: pdfs.rows[0],
    },
  });
};

const getDonationsChart = async (req, res) => {
  const months = Math.min(parseInt(req.query.months) || 6, 24);

  const result = await query(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', creado_en), 'YYYY-MM') AS mes,
       TO_CHAR(DATE_TRUNC('month', creado_en), 'Mon YYYY') AS mes_label,
       COUNT(*) AS cantidad,
       COALESCE(SUM(monto), 0) AS total
     FROM donaciones
     WHERE estado = 'completada'
       AND creado_en >= NOW() - ($1 || ' months')::INTERVAL
     GROUP BY DATE_TRUNC('month', creado_en)
     ORDER BY DATE_TRUNC('month', creado_en) ASC`,
    [months]
  );

  res.json({ success: true, data: result.rows });
};

module.exports = { getStats, getDonationsChart };
