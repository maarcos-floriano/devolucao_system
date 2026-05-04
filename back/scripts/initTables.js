const database = require('../config/database');

const DUPLICATE_COLUMN = 'ER_DUP_FIELDNAME';
const DUPLICATE_INDEX = 'ER_DUP_KEYNAME';

async function runSchemaQuery(pool, query, { warnOnly = false, ignoredCodes = [] } = {}) {
  try {
    await pool.query(query);
  } catch (error) {
    if (ignoredCodes.includes(error.code)) {
      return;
    }

    if (warnOnly) {
      console.warn(`Nao foi possivel aplicar schema no backup: ${error.message}`);
      return;
    }

    throw error;
  }
}

async function runOnBothPools(query, options = {}) {
  await runSchemaQuery(database.mainPool, query, options);
  if (database.backupPool) {
    await runSchemaQuery(database.backupPool, query, { ...options, warnOnly: true });
  }
}

async function ensureColumn(table, column, definition) {
  await runOnBothPools(
    `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
    { ignoredCodes: [DUPLICATE_COLUMN] }
  );
}

async function ensureIndex(table, indexName, definition) {
  await runOnBothPools(
    `ALTER TABLE ${table} ADD INDEX ${indexName} ${definition}`,
    { ignoredCodes: [DUPLICATE_INDEX] }
  );
}

async function createTables() {
  try {
    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS maquinas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        codigo VARCHAR(255) NOT NULL,
        config TEXT NOT NULL,
        defeito TEXT,
        data_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
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
        origem TEXT,
        rma BOOLEAN,
        data DATETIME,
        observacao TEXT,
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
        tipo VARCHAR(40) NOT NULL DEFAULT 'divergencia',
        devolucao_id INT NULL,
        cliente VARCHAR(255),
        origem VARCHAR(120),
        item_esperado TEXT,
        data_previsao DATE,
        problema TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'aberto',
        acao_tomada TEXT,
        email_solicitante VARCHAR(255),
        email_responsavel VARCHAR(255),
        acesso_remoto_em DATETIME,
        observacao TEXT,
        criado_em DATETIME,
        resolvido_em DATETIME,
        INDEX idx_chamados_status (status),
        INDEX idx_chamados_devolucao (devolucao_id),
        INDEX idx_chamados_tipo_status (tipo, status),
        INDEX idx_chamados_cliente (cliente)
      )`,
    ];

    console.log('Criando/verificando tabelas...');

    for (const query of tableQueries) {
      await runOnBothPools(query);
      console.log(`Tabela criada/verificada: ${query.split('(')[0].replace('CREATE TABLE IF NOT EXISTS', '').trim()}`);
    }

    // Compatibilidade com bancos ja existentes. Apenas adiciona/ajusta schema,
    // nunca apaga tabelas nem dados.
    await ensureColumn('devolucao', 'imagem', 'TEXT');

    await ensureColumn('maquinas', 'fkDevolucao', 'INT');

    await ensureColumn('monitores', 'origem', 'TEXT');
    await ensureColumn('monitores', 'observacao', 'TEXT');
    await ensureColumn('monitores', 'saiu_venda', 'BOOLEAN DEFAULT 0');
    await ensureColumn('monitores', 'data_saida_venda', 'DATETIME');
    await ensureColumn('monitores', 'fkDevolucao', 'INT');

    await runOnBothPools('ALTER TABLE chamados MODIFY COLUMN devolucao_id INT NULL');
    await ensureColumn('chamados', 'tipo', "VARCHAR(40) NOT NULL DEFAULT 'divergencia'");
    await ensureColumn('chamados', 'cliente', 'VARCHAR(255)');
    await ensureColumn('chamados', 'origem', 'VARCHAR(120)');
    await ensureColumn('chamados', 'item_esperado', 'TEXT');
    await ensureColumn('chamados', 'data_previsao', 'DATE');
    await ensureColumn('chamados', 'email_solicitante', 'VARCHAR(255)');
    await ensureColumn('chamados', 'email_responsavel', 'VARCHAR(255)');
    await ensureColumn('chamados', 'acesso_remoto_em', 'DATETIME');
    await ensureColumn('chamados', 'observacao', 'TEXT');
    await ensureIndex('chamados', 'idx_chamados_tipo_status', '(tipo, status)');
    await ensureIndex('chamados', 'idx_chamados_cliente', '(cliente)');

    console.log('Todas as tabelas foram verificadas/criadas com sucesso.');
  } catch (err) {
    console.error('Erro ao criar/verificar tabelas:', err.message);
    throw err;
  }
}

if (require.main === module) {
  createTables()
    .then(() => {
      console.log('Script de inicializacao concluido.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Erro fatal:', err);
      process.exit(1);
    });
}

module.exports = createTables;
