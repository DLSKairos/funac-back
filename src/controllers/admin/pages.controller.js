const { query, getClient } = require('../../config/database');
const { sanitizeHtml } = require('../../utils/helpers');

const VALID_PAGES = ['quienes_somos', 'valores', 'mision_vision', 'contacto'];

const listPages = async (req, res) => {
  const result = await query(
    `SELECT pagina, COUNT(*) AS secciones, MAX(actualizado_en) AS ultima_actualizacion
     FROM contenido_paginas
     GROUP BY pagina
     ORDER BY pagina ASC`,
    []
  );

  res.json({ success: true, data: result.rows });
};

const getPageContent = async (req, res) => {
  const { pagina } = req.params;

  if (!VALID_PAGES.includes(pagina)) {
    return res.status(404).json({ success: false, error: 'Pagina no encontrada' });
  }

  const result = await query(
    `SELECT id, seccion, contenido, orden, icono, activo, actualizado_por, actualizado_en
     FROM contenido_paginas
     WHERE pagina = $1
     ORDER BY orden ASC`,
    [pagina]
  );

  res.json({ success: true, data: result.rows });
};

const updatePage = async (req, res) => {
  const { pagina } = req.params;
  const { secciones } = req.body;

  if (!VALID_PAGES.includes(pagina)) {
    return res.status(404).json({ success: false, error: 'Pagina no encontrada' });
  }

  if (!Array.isArray(secciones) || secciones.length === 0) {
    return res.status(400).json({ success: false, error: 'Se requiere un array de secciones' });
  }

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Eliminar secciones que ya no están en la lista enviada
    const nombresActuales = secciones.map((s) => s.seccion).filter(Boolean);
    await client.query(
      `DELETE FROM contenido_paginas WHERE pagina = $1 AND seccion != ALL($2::text[])`,
      [pagina, nombresActuales]
    );

    for (const [index, seccion] of secciones.entries()) {
      if (!seccion.seccion) continue;

      const contenidoSanitizado = sanitizeHtml(seccion.contenido || '');

      await client.query(
        `INSERT INTO contenido_paginas (pagina, seccion, contenido, orden, icono, activo, actualizado_por)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (pagina, seccion) DO UPDATE
         SET contenido = EXCLUDED.contenido,
             orden = EXCLUDED.orden,
             icono = EXCLUDED.icono,
             activo = EXCLUDED.activo,
             actualizado_por = EXCLUDED.actualizado_por,
             actualizado_en = NOW()`,
        [
          pagina,
          seccion.seccion,
          contenidoSanitizado,
          seccion.orden !== undefined ? seccion.orden : index,
          seccion.icono || null,
          seccion.activo !== false,
          req.user.id,
        ]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion) VALUES ($1, $2, $3)",
    [req.user.id, 'update_page', `Pagina '${pagina}' actualizada`]
  ).catch(console.error);

  res.json({ success: true, message: `Pagina '${pagina}' actualizada exitosamente` });
};

module.exports = { listPages, getPageContent, updatePage };
