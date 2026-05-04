const DualDatabase = require('../middleware/dualDatabase');
const { buildSearchWhere } = require('../utils/search');

const SEARCH_FIELDS = ['codigo', 'config', 'CAST(id AS CHAR)'];

class MaquinaConfiguracao {
  static async create({ codigo, config }) {
    const sql = `INSERT INTO maquina_configuracoes (codigo, config) VALUES (?, ?)`;
    const result = await DualDatabase.executeOnBothPools(sql, [codigo, config]);
    return { id: result.insertId, codigo, config };
  }

  static async findAll(search = '') {
    const searchWhere = buildSearchWhere(SEARCH_FIELDS, search);
    const sql = `
      SELECT id, codigo, config
      FROM maquina_configuracoes
      WHERE ${searchWhere.clause}
      ORDER BY config ASC
    `;

    return DualDatabase.executeOnMainPool(sql, searchWhere.params);
  }

  static async findById(id) {
    const rows = await DualDatabase.executeOnMainPool(
      'SELECT id, codigo, config FROM maquina_configuracoes WHERE id = ?',
      [id]
    );

    return rows[0] || null;
  }

  static async findByCodigo(codigo) {
    const rows = await DualDatabase.executeOnMainPool(
      'SELECT id, codigo, config FROM maquina_configuracoes WHERE codigo = ?',
      [codigo]
    );

    return rows[0] || null;
  }

  static async update(id, { codigo, config }) {
    const atual = await this.findById(id);
    if (!atual) {
      throw new Error('Configuracao nao encontrada');
    }

    await DualDatabase.executeOnBothPools(
      'UPDATE maquina_configuracoes SET codigo = ?, config = ? WHERE id = ?',
      [codigo ?? atual.codigo, config ?? atual.config, id]
    );

    return this.findById(id);
  }

  static async delete(id) {
    const atual = await this.findById(id);
    if (!atual) {
      throw new Error('Configuracao nao encontrada');
    }

    await DualDatabase.executeOnBothPools('DELETE FROM maquina_configuracoes WHERE id = ?', [id]);
    return true;
  }
}

module.exports = MaquinaConfiguracao;
