const DualDatabase = require('../middleware/dualDatabase');

class Kit {
  constructor(data) {
    Object.assign(this, data);
  }

  static async create(kitData) {
    const sql = `
      INSERT INTO kit (sku, codigo, quantidade, lacre, defeito, observacao, origem, data, responsavel)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;

    const params = [
      kitData.sku,
      kitData.codigo,
      kitData.quantidade || 1,
      kitData.lacre || '',
      kitData.defeito || '',
      kitData.observacao || '',
      kitData.origem || '',
      kitData.responsavel,
    ];

    const result = await DualDatabase.insertOnBothPools(sql, params);
    return { id: result.insertId, ...kitData };
  }

  static async findAll({ page, limit, search }) {
    const offset = (page - 1) * limit;
    const termo = `%${search}%`;
    const sql = `
      SELECT id, sku, codigo, quantidade, lacre, defeito, observacao, origem, responsavel, data
      FROM kit
      WHERE (
        sku LIKE ? OR codigo LIKE ? OR lacre LIKE ? OR defeito LIKE ? OR observacao LIKE ? OR origem LIKE ? OR responsavel LIKE ? OR id LIKE ?
      )
      AND saiu_venda = 0
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    return DualDatabase.executeOnMainPool(sql, [termo, termo, termo, termo, termo, termo, termo, termo, limit, offset]);
  }

  static async count(search = '') {
    const termo = `%${search}%`;
    const sql = `
      SELECT COUNT(*) as total
      FROM kit
      WHERE (sku LIKE ? OR codigo LIKE ? OR lacre LIKE ? OR defeito LIKE ? OR observacao LIKE ? OR origem LIKE ? OR responsavel LIKE ?)
      AND saiu_venda = 0
    `;

    const result = await DualDatabase.count(sql, [termo, termo, termo, termo, termo, termo, termo]);
    return result.total || 0;
  }

  static async findById(id) {
    const sql = `SELECT * FROM kit WHERE id = ? AND saiu_venda = 0`;
    const rows = await DualDatabase.executeOnMainPool(sql, [id]);
    return rows.length ? new Kit(rows[0]) : null;
  }

  static async update(id, kitData) {
    const kit = await this.findById(id);
    if (!kit) throw new Error('Kit não encontrado');

    const sql = `
      UPDATE kit
      SET sku = ?, codigo = ?, quantidade = ?, lacre = ?, defeito = ?, observacao = ?, origem = ?, responsavel = ?
      WHERE id = ?
    `;

    const params = [
      kitData.sku || kit.sku,
      kitData.codigo || kit.codigo,
      kitData.quantidade || kit.quantidade,
      kitData.lacre || kit.lacre,
      kitData.defeito || kit.defeito,
      kitData.observacao || kit.observacao,
      kitData.origem || kit.origem,
      kitData.responsavel || kit.responsavel,
      id,
    ];

    await DualDatabase.executeOnBothPools(sql, params);
    return this.findById(id);
  }

  static async delete(id) {
    await DualDatabase.executeOnBothPools('UPDATE kit SET saiu_venda = 1, data_saida_venda = NOW() WHERE id = ?', [id]);
    return true;
  }

  static async findToday() {
    return DualDatabase.executeOnMainPool('SELECT id, sku, codigo, quantidade, lacre, defeito, observacao, origem, responsavel, data FROM kit WHERE DATE(data) = CURDATE() AND saiu_venda = 0 ORDER BY id DESC');
  }

  static async getDailyReport(dateFim) {
    const fim = dateFim ? new Date(dateFim) : new Date();
    const inicio = new Date(fim);
    inicio.setDate(fim.getDate() - 6);

    const sql = 'SELECT * FROM kit WHERE DATE(data) BETWEEN ? AND ? AND saiu_venda = 0 ORDER BY id DESC';
    return DualDatabase.executeOnMainPool(sql, [inicio.toISOString().slice(0, 10), fim.toISOString().slice(0, 10)]);
  }

  static async getSkuReport() {
    const sql = 'SELECT sku, COUNT(*) as quantidade, GROUP_CONCAT(id SEPARATOR ", ") as ids FROM kit WHERE saiu_venda = 0 GROUP BY sku ORDER BY sku';
    return DualDatabase.executeOnMainPool(sql);
  }

  static async getStats() {
    const sql = `
      SELECT
        origem,
        COUNT(*) AS total,
        COUNT(CASE WHEN DATE(data) = CURDATE() THEN 1 END) AS hoje,
        COUNT(CASE WHEN defeito IS NOT NULL AND defeito <> '' THEN 1 END) AS comDefeito,
        COUNT(*) AS porOrigem
      FROM kit
      WHERE saiu_venda = 0
      GROUP BY origem
    `;

    return DualDatabase.executeOnMainPool(sql);
  }
}

module.exports = Kit;
