const mysql = require('mysql2/promise');

const backupEnabled = Boolean(process.env.DB_BACKUP_HOST);

const mainPool = mysql.createPool({
  host: process.env.DB_MAIN_HOST,
  port: process.env.DB_MAIN_PORT,
  user: process.env.DB_MAIN_USER,
  password: process.env.DB_MAIN_PASSWORD,
  database: process.env.DB_MAIN_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
});

const backupPool = backupEnabled
  ? mysql.createPool({
    host: process.env.DB_BACKUP_HOST,
    port: process.env.DB_BACKUP_PORT,
    user: process.env.DB_BACKUP_USER,
    password: process.env.DB_BACKUP_PASSWORD,
    database: process.env.DB_BACKUP_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  : null;

async function testConnections() {
  try {
    const mainConn = await mainPool.getConnection();
    console.log('Banco principal conectado.');
    mainConn.release();
  } catch (err) {
    console.error('Erro ao conectar no banco principal:', err.message);
    return false;
  }

  if (!backupPool) {
    console.log('Banco backup nao configurado; usando apenas banco principal.');
    return true;
  }

  try {
    const backupConn = await backupPool.getConnection();
    console.log('Banco backup conectado.');
    backupConn.release();
  } catch (err) {
    console.warn('Banco backup indisponivel:', err.message);
  }

  return true;
}

module.exports = {
  mainPool,
  backupPool,
  backupEnabled,
  testConnections,
};
