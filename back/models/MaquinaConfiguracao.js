const DualDatabase = require('../middleware/dualDatabase');

class MaquinaConfiguracao {
  static async create({ codigo, config }) {
    const sql = `INSERT INTO maquina_configuracoes (codigo, config) VALUES (?, ?)`;
    const result = await DualDatabase.executeOnBothPools(sql, [codigo, config]);
    return { id: result.insertId, codigo, config };
  }

  static async findAll(search = '') {
    const termo = `%${search}%`;
    const sql = `
      SELECT id, codigo, config
      FROM maquina_configuracoes
      WHERE codigo LIKE ? OR config LIKE ? OR id LIKE ?
      ORDER BY config ASC
    `;

    return DualDatabase.executeOnMainPool(sql, [termo, termo, termo]);
  }
}

module.exports = MaquinaConfiguracao;
