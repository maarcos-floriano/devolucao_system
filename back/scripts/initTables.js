const database = require('../config/database');

async function createTables() {
  let conn;
  try {
    conn = await database.mainPool.getConnection();

    const tableQueries = [
      `DROP TABLE IF EXISTS maquinas`,
      `CREATE TABLE IF NOT EXISTS maquinas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(255) NOT NULL,
        config TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS maquina_configuracoes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(255) NOT NULL,
        config TEXT NOT NULL,
        UNIQUE KEY uq_maquina_configuracoes_codigo (codigo)
      )`,
      `CREATE TABLE IF NOT EXISTS monitores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        marca TEXT,
        tamanho TEXT,
        rma BOOLEAN,
        data DATETIME,
        responsavel TEXT,
        saiu_venda BOOLEAN DEFAULT 0,
        data_saida_venda DATETIME,
        fkDevolucao INT
      )`,
      `CREATE TABLE IF NOT EXISTS devolucao (
        id INT AUTO_INCREMENT PRIMARY KEY,
        origem TEXT,
        cliente TEXT,
        produto TEXT,
        codigo TEXT,
        observacao TEXT,
        imagem TEXT,
        data DATETIME
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
        data DATETIME,
        responsavel TEXT,
        saiu_venda BOOLEAN DEFAULT 0,
        data_saida_venda DATETIME,
        fkDevolucao INT
      )`,
      `CREATE TABLE IF NOT EXISTS chamados (
        id INT AUTO_INCREMENT PRIMARY KEY,
        devolucao_id INT NOT NULL,
        problema TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'aberto',
        acao_tomada TEXT,
        criado_em DATETIME,
        resolvido_em DATETIME,
        INDEX idx_chamados_status (status),
        INDEX idx_chamados_devolucao (devolucao_id)
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

    // Compatibilidade com bancos já existentes
    const devolucaoAlterQuery = 'ALTER TABLE devolucao ADD COLUMN imagem TEXT';

    try {
      await conn.query(devolucaoAlterQuery);
      console.log('✅ Coluna imagem adicionada na tabela devolucao (principal).');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }

    try {
      await database.backupPool.query(devolucaoAlterQuery);
      console.log('✅ Coluna imagem adicionada na tabela devolucao (backup).');
    } catch (error) {
      if (error.code !== 'ER_DUP_FIELDNAME') {
        console.warn(`⚠️ Não foi possível atualizar tabela devolucao no backup: ${error.message}`);
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
