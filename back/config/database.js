const mysql = require('mysql2/promise');

// ======== BANCO PRINCIPAL (AIVEN) ========
const mainPool = mysql.createPool({
  host: process.env.DB_MAIN_HOST,
  port: process.env.DB_MAIN_PORT,
  user: process.env.DB_MAIN_USER,
  password: process.env.DB_MAIN_PASSWORD,
  database: process.env.DB_MAIN_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

// ======== BANCO BACKUP (LOCAL) ========
const backupPool = mysql.createPool({
  host: process.env.DB_BACKUP_HOST,
  port: process.env.DB_BACKUP_PORT,
  user: process.env.DB_BACKUP_USER,
  password: process.env.DB_BACKUP_PASSWORD,
  database: process.env.DB_BACKUP_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ======== TESTE DE CONEXÃO ========
async function testConnections() {
  try {
    const mainConn = await mainPool.getConnection();
    console.log('✅ Banco principal conectado (Aiven)');
    mainConn.release();
  } catch (err) {
    console.error('❌ Erro ao conectar no banco principal:', err.message);
    return false;
  }

  try {
    const backupConn = await backupPool.getConnection();
    console.log('✅ Banco backup conectado (Local)');
    backupConn.release();
  } catch (err) {
    console.warn('⚠️ Banco backup indisponível:', err.message);
    // NÃO derruba a aplicação
  }

  return true;
}

module.exports = {
  mainPool,
  backupPool,
  testConnections
};
