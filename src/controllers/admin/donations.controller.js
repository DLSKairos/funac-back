const ExcelJS = require('exceljs');
const { query } = require('../../config/database');
const emailService = require('../../services/email.service');

const listDonations = async (req, res) => {
  const {
    page = 1,
    limit = 20,
    estado,
    fecha_desde,
    fecha_hasta,
    monto_min,
    monto_max,
    es_recurrente,
    search,
  } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  const conditions = [];
  const params = [];
  let paramCount = 1;

  if (estado) {
    conditions.push(`estado = $${paramCount++}`);
    params.push(estado);
  }

  if (fecha_desde) {
    conditions.push(`creado_en >= $${paramCount++}`);
    params.push(fecha_desde);
  }

  if (fecha_hasta) {
    conditions.push(`creado_en <= $${paramCount++}`);
    params.push(fecha_hasta);
  }

  if (monto_min) {
    conditions.push(`monto >= $${paramCount++}`);
    params.push(parseFloat(monto_min));
  }

  if (monto_max) {
    conditions.push(`monto <= $${paramCount++}`);
    params.push(parseFloat(monto_max));
  }

  if (es_recurrente !== undefined && es_recurrente !== '') {
    conditions.push(`es_recurrente = $${paramCount++}`);
    params.push(es_recurrente === 'true');
  }

  if (search) {
    conditions.push(`(nombre_completo ILIKE $${paramCount} OR email ILIKE $${paramCount} OR referencia_epayco ILIKE $${paramCount})`);
    params.push(`%${search}%`);
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [dataResult, countResult] = await Promise.all([
    query(
      `SELECT id, nombre_completo, email, cedula, monto, moneda, estado,
              referencia_epayco, es_recurrente, frecuencia, aparecer_muro_donantes,
              comprobante_enviado, creado_en, fecha_pago
       FROM donaciones
       ${whereClause}
       ORDER BY creado_en DESC
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limitNum, offset]
    ),
    query(`SELECT COUNT(*) AS total FROM donaciones ${whereClause}`, params),
  ]);

  const total = parseInt(countResult.rows[0].total);
  const totalPages = Math.ceil(total / limitNum);

  res.json({
    success: true,
    data: dataResult.rows,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasNext: pageNum < totalPages,
      hasPrev: pageNum > 1,
    },
  });
};

const getDonation = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT id, nombre_completo, email, cedula, telefono, monto, moneda, estado,
            referencia_epayco, ref_payco, transaction_id, es_recurrente, frecuencia,
            aparecer_muro_donantes, comprobante_enviado, creado_en, fecha_pago, actualizado_en
     FROM donaciones
     WHERE id = $1`,
    [id]
  );

  const donacion = result.rows[0];
  if (!donacion) {
    return res.status(404).json({ success: false, error: 'Donacion no encontrada' });
  }

  res.json({ success: true, data: donacion });
};

const resendReceipt = async (req, res) => {
  const { id } = req.params;

  const result = await query(
    `SELECT id, nombre_completo, email, monto, moneda, referencia_epayco,
            es_recurrente, frecuencia, estado
     FROM donaciones
     WHERE id = $1`,
    [id]
  );

  const donacion = result.rows[0];
  if (!donacion) {
    return res.status(404).json({ success: false, error: 'Donacion no encontrada' });
  }

  if (donacion.estado !== 'completada') {
    return res.status(400).json({
      success: false,
      error: 'Solo se puede reenviar el comprobante de donaciones completadas',
    });
  }

  await emailService.sendDonationReceipt(donacion);

  query(
    "INSERT INTO logs_actividad_admin (usuario_id, accion, descripcion, recurso_id) VALUES ($1, $2, $3, $4)",
    [req.user.id, 'resend_receipt', `Comprobante reenviado para donacion ${donacion.referencia_epayco}`, id]
  ).catch(console.error);

  res.json({ success: true, message: 'Comprobante reenviado exitosamente' });
};

const exportDonations = async (req, res) => {
  const {
    format = 'excel',
    estado,
    fecha_desde,
    fecha_hasta,
    monto_min,
    monto_max,
    es_recurrente,
  } = req.query;

  const conditions = [];
  const params = [];
  let paramCount = 1;

  if (estado) { conditions.push(`estado = $${paramCount++}`); params.push(estado); }
  if (fecha_desde) { conditions.push(`creado_en >= $${paramCount++}`); params.push(fecha_desde); }
  if (fecha_hasta) { conditions.push(`creado_en <= $${paramCount++}`); params.push(fecha_hasta); }
  if (monto_min) { conditions.push(`monto >= $${paramCount++}`); params.push(parseFloat(monto_min)); }
  if (monto_max) { conditions.push(`monto <= $${paramCount++}`); params.push(parseFloat(monto_max)); }
  if (es_recurrente !== undefined && es_recurrente !== '') {
    conditions.push(`es_recurrente = $${paramCount++}`);
    params.push(es_recurrente === 'true');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await query(
    `SELECT nombre_completo, email, cedula, monto, moneda, estado, referencia_epayco,
            es_recurrente, frecuencia, aparecer_muro_donantes, creado_en, fecha_pago
     FROM donaciones
     ${whereClause}
     ORDER BY creado_en DESC`,
    params
  );

  const donaciones = result.rows;

  if (format === 'excel') {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FUNAC';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Donaciones');

    sheet.columns = [
      { header: 'Nombre', key: 'nombre_completo', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Cedula', key: 'cedula', width: 15 },
      { header: 'Monto', key: 'monto', width: 15, style: { numFmt: '#,##0.00' } },
      { header: 'Moneda', key: 'moneda', width: 10 },
      { header: 'Estado', key: 'estado', width: 15 },
      { header: 'Referencia', key: 'referencia_epayco', width: 25 },
      { header: 'Recurrente', key: 'es_recurrente', width: 12 },
      { header: 'Frecuencia', key: 'frecuencia', width: 15 },
      { header: 'Muro Donantes', key: 'aparecer_muro_donantes', width: 16 },
      { header: 'Fecha Registro', key: 'creado_en', width: 20 },
      { header: 'Fecha Pago', key: 'fecha_pago', width: 20 },
    ];

    // Estilo de encabezado
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1A5276' },
    };
    sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    for (const donacion of donaciones) {
      sheet.addRow({
        ...donacion,
        es_recurrente: donacion.es_recurrente ? 'Si' : 'No',
        aparecer_muro_donantes: donacion.aparecer_muro_donantes ? 'Si' : 'No',
        creado_en: donacion.creado_en ? new Date(donacion.creado_en).toLocaleString('es-CO') : '',
        fecha_pago: donacion.fecha_pago ? new Date(donacion.fecha_pago).toLocaleString('es-CO') : '',
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="donaciones_${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } else {
    res.status(400).json({ success: false, error: 'Formato no soportado. Use format=excel' });
  }
};

module.exports = { listDonations, getDonation, resendReceipt, exportDonations };
