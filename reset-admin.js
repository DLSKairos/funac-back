const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const res = await pool.query('SELECT id, username, email, activo FROM usuarios_admin');

  if (res.rows.length === 0) {
    console.log('No hay usuarios admin en la base de datos.');
    await pool.end();
    return;
  }

  console.log('\nAdmins existentes:');
  res.rows.forEach(u => {
    console.log(`  id: ${u.id} | username: ${u.username} | email: ${u.email} | activo: ${u.activo}`);
  });

  // --- CONFIGURAR AQUÍ ---
  const ADMIN_ID = 1;              // Cambia al id del admin que quieres resetear
  const NUEVA_PASSWORD = 'Admin123!'; // Cambia a la contraseña que quieras
  // -----------------------

  const hash = await bcrypt.hash(NUEVA_PASSWORD, 10);
  await pool.query('UPDATE usuarios_admin SET password_hash = $1 WHERE id = $2', [hash, ADMIN_ID]);

  console.log(`\nContraseña reseteada para id=${ADMIN_ID}`);
  console.log(`  Nueva contraseña: ${NUEVA_PASSWORD}`);

  await pool.end();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
