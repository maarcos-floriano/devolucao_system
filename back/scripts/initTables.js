const database = require('../config/database');

async function createTables() {
  let conn;
  try {
    conn = await database.mainPool.getConnection();

    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS maquinas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processador TEXT,
        memoria TEXT,
        armazenamento TEXT,
        fonte TEXT,
        origem TEXT,
        observacao TEXT,
        defeito TEXT,
        lacre TEXT,
        data TEXT,
        responsavelMaquina TEXT,
        fkDevolucao INT
      )`,
      `CREATE TABLE IF NOT EXISTS monitores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        marca TEXT,
        tamanho TEXT,
        quantidade INT,
        rma BOOLEAN,
        data TEXT,
        responsavel TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS teclados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        marca TEXT,
        tipo TEXT,
        quantidade INT,
        rma BOOLEAN,
        data TEXT,
        responsavel TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS mouses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        marca TEXT,
        tipo TEXT,
        quantidade INT,
        rma BOOLEAN,
        data TEXT,
        responsavel TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS pecas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tipo TEXT,
        modelo TEXT,
        quantidade INT,
        rma BOOLEAN,
        data TEXT,
        responsavel TEXT,
        observacao TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS retirada (
        id INT AUTO_INCREMENT PRIMARY KEY,
        hardware TEXT,
        quantidade INT,
        data TEXT,
        responsavel TEXT,
        observacao TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS devolucao (
        id INT AUTO_INCREMENT PRIMARY KEY,
        origem TEXT,
        cliente TEXT,
        produto TEXT,
        codigo TEXT,
        observacao TEXT,
        dataHora TEXT
      )`,
      `CREATE TABLE IF NOT EXISTS kit (
        id INT AUTO_INCREMENT PRIMARY KEY,
        processador TEXT,
        memoria TEXT,
        placaMae TEXT,
        lacre TEXT,
        defeito TEXT,
        observacao TEXT,
        origem TEXT,
        data TEXT,
        responsavel TEXT,
        fkDevolucao INT
      )`
    ];

    console.log('🔄 Criando/verificando tabelas...');
    
    for (const query of tableQueries) {
      await conn.query(query);
      console.log(`✅ Tabela criada/verificada: ${query.split('(')[0].replace('CREATE TABLE IF NOT EXISTS', '').trim()}`);
      
      // Tenta criar no backup também
      try {
        await database.backupPool.query(query);
      } catch (backupError) {
        console.warn(`⚠️ Não foi possível criar tabela no backup: ${backupError.message}`);
      }
    }

    console.log('✅ Todas as tabelas foram verificadas/criadas com sucesso.');
  } catch (err) {
    console.error('❌ Erro ao criar/verificar tabelas:', err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('✨ Script de inicialização concluído.');
      process.exit(0);
    })
    .catch(err => {
      console.error('💥 Erro fatal:', err);
      process.exit(1);
    });
}

module.exports = createTables;