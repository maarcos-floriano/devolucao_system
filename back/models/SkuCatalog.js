const DualDatabase = require('../middleware/dualDatabase');

class SkuCatalog {
  static tableByType(type) {
    if (type === 'maquinas') return 'sku_maquinas';
    if (type === 'kits') return 'sku_kits';
    throw new Error('Tipo de SKU inválido');
  }

  static async findAll(type, search = '') {
    const table = this.tableByType(type);
    const termo = `%${search}%`;

    const sql = `
      SELECT id, sku, codigo, ativo, created_at
      FROM ${table}
      WHERE ativo = 1
        AND (sku LIKE ? OR codigo LIKE ?)
      ORDER BY codigo ASC
    `;

    return DualDatabase.executeOnMainPool(sql, [termo, termo]);
  }

  static async create(type, data) {
    const table = this.tableByType(type);

    const sql = `
      INSERT INTO ${table} (sku, codigo, ativo, created_at)
      VALUES (?, ?, 1, NOW())
    `;

    const result = await DualDatabase.insertOnBothPools(sql, [data.sku, data.codigo]);
    return {
      id: result.insertId,
      sku: data.sku,
      codigo: data.codigo,
      ativo: 1,
    };
  }
}

module.exports = SkuCatalog;
