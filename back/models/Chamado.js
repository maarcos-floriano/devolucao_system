const DualDatabase = require('../middleware/dualDatabase');

class Chamado {
  static async create(chamadoData) {
    try {
      const sql = `
        INSERT INTO chamados (devolucao_id, problema, status, acao_tomada, criado_em, resolvido_em)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const params = [
        chamadoData.devolucao_id,
        chamadoData.problema,
        chamadoData.status || 'aberto',
        chamadoData.acao_tomada || '',
        chamadoData.criado_em || now,
        chamadoData.resolvido_em || null,
      ];

      const result = await DualDatabase.insertOnBothPools(sql, params);
      return this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Erro ao criar chamado: ${error.message}`);
    }
  }

  static async findAll({ page = 1, limit = 10, search = '', status }) {
    try {
      const offset = (page - 1) * limit;
      const termo = `%${search}%`;

      let sql = `
        SELECT c.*, d.cliente, d.produto, d.origem
        FROM chamados c
        LEFT JOIN devolucao d ON d.id = c.devolucao_id
        WHERE (
          c.problema LIKE ? OR
          c.acao_tomada LIKE ? OR
          CAST(c.devolucao_id AS CHAR) LIKE ? OR
          d.cliente LIKE ? OR
          d.produto LIKE ?
        )
      `;

      const params = [termo, termo, termo, termo, termo];

      if (status) {
        sql += ' AND c.status = ?';
        params.push(status);
      }

      sql += ' ORDER BY c.id DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      return await DualDatabase.executeOnMainPool(sql, params);
    } catch (error) {
      throw new Error(`Erro ao buscar chamados: ${error.message}`);
    }
  }

  static async count(search = '', status) {
    try {
      const termo = `%${search}%`;
      let sql = `
        SELECT COUNT(*) as total
        FROM chamados c
        LEFT JOIN devolucao d ON d.id = c.devolucao_id
        WHERE (
          c.problema LIKE ? OR
          c.acao_tomada LIKE ? OR
          CAST(c.devolucao_id AS CHAR) LIKE ? OR
          d.cliente LIKE ? OR
          d.produto LIKE ?
        )
      `;

      const params = [termo, termo, termo, termo, termo];

      if (status) {
        sql += ' AND c.status = ?';
        params.push(status);
      }

      const result = await DualDatabase.count(sql, params);
      return result.total || 0;
    } catch (error) {
      throw new Error(`Erro ao contar chamados: ${error.message}`);
    }
  }

  static async countOpen() {
    const sql = `SELECT COUNT(*) as total FROM chamados WHERE status = 'aberto'`;
    const result = await DualDatabase.count(sql, []);
    return result.total || 0;
  }

  static async findById(id) {
    try {
      const sql = `
        SELECT c.*, d.cliente, d.produto, d.origem
        FROM chamados c
        LEFT JOIN devolucao d ON d.id = c.devolucao_id
        WHERE c.id = ?
      `;
      const rows = await DualDatabase.executeOnMainPool(sql, [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw new Error(`Erro ao buscar chamado: ${error.message}`);
    }
  }

  static async update(id, chamadoData) {
    try {
      const atual = await this.findById(id);
      if (!atual) {
        throw new Error('Chamado não encontrado');
      }

      const status = chamadoData.status || atual.status;
      const resolveuAgora = status === 'resolvido' && atual.status !== 'resolvido';

      const sql = `
        UPDATE chamados SET
          devolucao_id = ?,
          problema = ?,
          status = ?,
          acao_tomada = ?,
          resolvido_em = ?
        WHERE id = ?
      `;

      const params = [
        chamadoData.devolucao_id || atual.devolucao_id,
        chamadoData.problema || atual.problema,
        status,
        chamadoData.acao_tomada !== undefined ? chamadoData.acao_tomada : atual.acao_tomada,
        resolveuAgora ? new Date().toISOString().slice(0, 19).replace('T', ' ') : atual.resolvido_em,
        id,
      ];

      await DualDatabase.executeOnBothPools(sql, params);
      return this.findById(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar chamado: ${error.message}`);
    }
  }
}

module.exports = Chamado;
