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
        data DATETIME,
        responsavel TEXT,
        placaVideo TEXT,
        gabinete TEXT,
        sku TEXT,
        codigo VARCHAR(100),
        quantidade INT DEFAULT 1,
        saiu_venda BOOLEAN DEFAULT 0,
        data_saida DATETIME,
        fkDevolucao INT
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
        sku TEXT,
        codigo VARCHAR(100),
        quantidade INT DEFAULT 1,
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
      )`,
      `CREATE TABLE IF NOT EXISTS sku_maquinas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sku TEXT NOT NULL,
        codigo VARCHAR(100) NOT NULL UNIQUE,
        ativo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS sku_kits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sku TEXT NOT NULL,
        codigo VARCHAR(100) NOT NULL UNIQUE,
        ativo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    console.log('🔄 Criando/verificando tabelas...');

    for (const query of tableQueries) {
      await conn.query(query);
      console.log(`✅ Tabela criada/verificada: ${query.split('(')[0].replace('CREATE TABLE IF NOT EXISTS', '').trim()}`);

      try {
        await database.backupPool.query(query);
      } catch (backupError) {
        console.warn(`⚠️ Não foi possível criar tabela no backup: ${backupError.message}`);
      }
    }

    const alterQueries = [
      'ALTER TABLE devolucao ADD COLUMN imagem TEXT',
      'ALTER TABLE maquinas ADD COLUMN sku TEXT',
      'ALTER TABLE maquinas ADD COLUMN codigo VARCHAR(100)',
      'ALTER TABLE maquinas ADD COLUMN quantidade INT DEFAULT 1',
      'ALTER TABLE kit ADD COLUMN sku TEXT',
      'ALTER TABLE kit ADD COLUMN codigo VARCHAR(100)',
      'ALTER TABLE kit ADD COLUMN quantidade INT DEFAULT 1'
    ];

    for (const alterQuery of alterQueries) {
      try {
        await conn.query(alterQuery);
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') throw error;
      }

      try {
        await database.backupPool.query(alterQuery);
      } catch (error) {
        if (error.code !== 'ER_DUP_FIELDNAME') {
          console.warn(`⚠️ Não foi possível aplicar alteração no backup: ${error.message}`);
        }
      }
    }

    const defaultMachineSkus = [
      ['i5 8ª Geração 32GB DDR4 1TB NVMe 550W GT 730 4GB Gamer', '001'],
      ['i7 4ª Geração 16GB DDR3 1TB SSD 500W GT 730 4GB Gamer', '002'],
      ['R5 5500 16GB DDR4 1TB NVMe 650W GT 740 4GB Aquario', '003'],
      ['i5 8ª Geração 16GB DDR3 480GB SSD 600W S/Vídeo Joyas 5013', '004']
    ];

    for (const [sku, codigo] of defaultMachineSkus) {
      await conn.query('INSERT IGNORE INTO sku_maquinas (sku, codigo, ativo, created_at) VALUES (?, ?, 1, NOW())', [sku, codigo]);
      try {
        await database.backupPool.query('INSERT IGNORE INTO sku_maquinas (sku, codigo, ativo, created_at) VALUES (?, ?, 1, NOW())', [sku, codigo]);
      } catch (error) {
        console.warn(`⚠️ Não foi possível inserir SKU padrão no backup: ${error.message}`);
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
