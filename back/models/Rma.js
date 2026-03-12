const DualDatabase = require('../middleware/dualDatabase');

class Rma {
  static async create(rmaData) {
    const sql = `
      INSERT INTO rma (
        tipo_item,
        descricao_item,
        problema,
        destino,
        status,
        observacao,
        responsavel,
        fkDevolucao,
        data
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      rmaData.tipo_item,
      rmaData.descricao_item || '',
      rmaData.problema || '',
      rmaData.destino || '',
      rmaData.status || 'aberto',
      rmaData.observacao || '',
      rmaData.responsavel || '',
      rmaData.fkDevolucao || null,
      rmaData.data || new Date().toISOString().slice(0, 19).replace('T', ' '),
    ];

    const result = await DualDatabase.insertOnBothPools(sql, params);
    return { id: result.insertId, ...rmaData };
  }

  static async findAll({ page = 1, limit = 10, search = '' }) {
    const offset = (page - 1) * limit;
    const termo = `%${search}%`;

    const sql = `
      SELECT
        r.id,
        r.tipo_item,
        r.descricao_item,
        r.problema,
        r.destino,
        r.status,
        r.observacao,
        r.responsavel,
        r.fkDevolucao,
        r.data,
        d.cliente as devolucao_cliente,
        d.produto as devolucao_produto,
        d.origem as devolucao_origem
      FROM rma r
      LEFT JOIN devolucao d ON d.id = r.fkDevolucao
      WHERE (
        r.tipo_item LIKE ? OR
        r.descricao_item LIKE ? OR
        r.problema LIKE ? OR
        r.destino LIKE ? OR
        r.status LIKE ? OR
        r.observacao LIKE ? OR
        d.cliente LIKE ? OR
        d.produto LIKE ? OR
        d.origem LIKE ?
      )
      ORDER BY r.id DESC
      LIMIT ? OFFSET ?
    `;

    return DualDatabase.executeOnMainPool(sql, [
      termo,
      termo,
      termo,
      termo,
      termo,
      termo,
      termo,
      termo,
      termo,
      limit,
      offset,
    ]);
  }

  static async count(search = '') {
    const termo = `%${search}%`;

    const sql = `
      SELECT COUNT(*) as total
      FROM rma r
      LEFT JOIN devolucao d ON d.id = r.fkDevolucao
      WHERE (
        r.tipo_item LIKE ? OR
        r.descricao_item LIKE ? OR
        r.problema LIKE ? OR
        r.destino LIKE ? OR
        r.status LIKE ? OR
        r.observacao LIKE ? OR
        d.cliente LIKE ? OR
        d.produto LIKE ? OR
        d.origem LIKE ?
      )
    `;

    const result = await DualDatabase.count(sql, [
      termo,
      termo,
      termo,
      termo,
      termo,
      termo,
      termo,
      termo,
      termo,
    ]);

    return result.total || 0;
  }

  static async delete(id) {
    const sql = 'DELETE FROM rma WHERE id = ?';
    await DualDatabase.executeOnBothPools(sql, [id]);
    return true;
  }

  static async getDevolucoesSemVinculo() {
    const sql = `
      SELECT
        d.id,
        d.origem,
        d.cliente,
        d.produto,
        d.codigo,
        d.observacao,
        d.data
      FROM devolucao d
      LEFT JOIN maquinas m ON m.fkDevolucao = d.id
      LEFT JOIN monitores mo ON mo.fkDevolucao = d.id
      LEFT JOIN kit k ON k.fkDevolucao = d.id
      LEFT JOIN rma r ON r.fkDevolucao = d.id
      WHERE m.id IS NULL
        AND mo.id IS NULL
        AND k.id IS NULL
        AND r.id IS NULL
      ORDER BY d.id DESC
    `;

    return DualDatabase.executeOnMainPool(sql);
  }
}

module.exports = Rma;
