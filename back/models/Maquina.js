const DualDatabase = require('../middleware/dualDatabase');

class Maquina {
  constructor(data) {
    Object.assign(this, data);
  }

  static async create(maquinaData) {
    const sql = `
      INSERT INTO maquinas
      (sku, codigo, quantidade, origem, observacao, defeito, lacre, data, responsavel)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
    `;

    const params = [
      maquinaData.sku,
      maquinaData.codigo,
      maquinaData.quantidade || 1,
      maquinaData.origem || '',
      maquinaData.observacao || '',
      maquinaData.defeito || '',
      maquinaData.lacre || '',
      maquinaData.responsavel,
    ];

    const result = await DualDatabase.insertOnBothPools(sql, params);
    return { id: result.insertId, ...maquinaData };
  }

  static async findAll({ page, limit, search }) {
    const offset = (page - 1) * limit;
    const termo = `%${search}%`;

    const sql = `
      SELECT id, sku, codigo, quantidade, origem, responsavel, defeito, observacao, lacre, data
      FROM maquinas
      WHERE (
        sku LIKE ?
        OR codigo LIKE ?
        OR origem LIKE ?
        OR responsavel LIKE ?
        OR defeito LIKE ?
        OR observacao LIKE ?
        OR id LIKE ?
      )
      AND saiu_venda = 0
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    return DualDatabase.executeOnMainPool(sql, [termo, termo, termo, termo, termo, termo, termo, Number(limit), Number(offset)]);
  }

  static async findToday() {
    const sql = `
      SELECT id, sku, codigo, quantidade, origem, responsavel, defeito, observacao, lacre, data
      FROM maquinas
      WHERE DATE(data) = CURDATE() AND saiu_venda = 0
      ORDER BY id DESC
    `;

    return DualDatabase.executeOnMainPool(sql);
  }

  static async findById(id) {
    const sql = `SELECT * FROM maquinas WHERE id = ? AND saiu_venda = 0`;
    const rows = await DualDatabase.executeOnMainPool(sql, [id]);
    return rows.length ? new Maquina(rows[0]) : null;
  }

  static async update(id, maquinaData) {
    const maquina = await this.findById(id);
    if (!maquina) throw new Error('Máquina não encontrada');

    const sql = `
      UPDATE maquinas SET
        sku = ?,
        codigo = ?,
        quantidade = ?,
        origem = ?,
        observacao = ?,
        defeito = ?,
        lacre = ?,
        responsavel = ?
      WHERE id = ?
    `;

    const params = [
      maquinaData.sku || maquina.sku,
      maquinaData.codigo || maquina.codigo,
      maquinaData.quantidade || maquina.quantidade,
      maquinaData.origem || maquina.origem,
      maquinaData.observacao || maquina.observacao,
      maquinaData.defeito || maquina.defeito,
      maquinaData.lacre || maquina.lacre,
      maquinaData.responsavel || maquina.responsavel,
      id,
    ];

    await DualDatabase.executeOnBothPools(sql, params);
    return this.findById(id);
  }

  static async delete(id) {
    await DualDatabase.executeOnBothPools('UPDATE maquinas SET saiu_venda = 1, data_saida = NOW() WHERE id = ?', [id]);
    return true;
  }

  static async count(search) {
    const termo = `%${search}%`;
    const sql = `
      SELECT COUNT(*) AS total
      FROM maquinas
      WHERE (
        sku LIKE ?
        OR codigo LIKE ?
        OR origem LIKE ?
        OR responsavel LIKE ?
        OR defeito LIKE ?
        OR observacao LIKE ?
        OR id LIKE ?
      )
      AND saiu_venda = 0
    `;

    const result = await DualDatabase.count(sql, [termo, termo, termo, termo, termo, termo, termo]);
    return result.total || 0;
  }

  toJSON() {
    return { ...this };
  }
}

module.exports = Maquina;
