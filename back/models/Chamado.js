const DualDatabase = require('../middleware/dualDatabase');
const { buildSearchWhere, getPagination, isLooseMatch, normalizeForMatch } = require('../utils/search');

const SEARCH_FIELDS = [
  'c.tipo',
  'c.cliente',
  'c.origem',
  'c.item_esperado',
  'c.problema',
  'c.acao_tomada',
  'c.email_solicitante',
  'c.email_responsavel',
  'CAST(c.id AS CHAR)',
  'CAST(c.devolucao_id AS CHAR)',
  'd.cliente',
  'd.produto',
  'd.origem',
];

function toMysqlDateTime(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

function toMysqlDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function todayDateTime() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function buildProblem(chamadoData) {
  if (chamadoData.problema) {
    return chamadoData.problema;
  }

  if (chamadoData.tipo === 'acesso_remoto') {
    return chamadoData.observacao || 'Acesso remoto agendado';
  }

  return chamadoData.item_esperado
    ? `Ficar de olho: ${chamadoData.item_esperado}`
    : 'Ficar de olho em devolucao do cliente';
}

class Chamado {
  static async create(chamadoData) {
    try {
      const tipo = chamadoData.tipo || (chamadoData.acesso_remoto_em ? 'acesso_remoto' : 'acompanhar_devolucao');
      const sql = `
        INSERT INTO chamados (
          tipo,
          devolucao_id,
          cliente,
          origem,
          item_esperado,
          data_previsao,
          problema,
          status,
          acao_tomada,
          email_solicitante,
          email_responsavel,
          acesso_remoto_em,
          observacao,
          criado_em,
          resolvido_em
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        tipo,
        chamadoData.devolucao_id || null,
        chamadoData.cliente || null,
        chamadoData.origem || null,
        chamadoData.item_esperado || chamadoData.produto || null,
        toMysqlDate(chamadoData.data_previsao),
        buildProblem({ ...chamadoData, tipo }),
        chamadoData.status || 'aberto',
        chamadoData.acao_tomada || '',
        chamadoData.email_solicitante || null,
        chamadoData.email_responsavel || null,
        toMysqlDateTime(chamadoData.acesso_remoto_em),
        chamadoData.observacao || null,
        chamadoData.criado_em || todayDateTime(),
        chamadoData.resolvido_em || null,
      ];

      const result = await DualDatabase.insertOnBothPools(sql, params);
      return this.findById(result.insertId);
    } catch (error) {
      throw new Error(`Erro ao criar chamado: ${error.message}`);
    }
  }

  static async findAll({ page = 1, limit = 10, search = '', status, tipo } = {}) {
    try {
      const pagination = getPagination({ page, limit });
      const searchWhere = buildSearchWhere(SEARCH_FIELDS, search);

      let sql = `
        SELECT c.*,
          COALESCE(c.cliente, d.cliente) AS cliente,
          COALESCE(c.origem, d.origem) AS origem,
          d.cliente AS devolucao_cliente,
          d.produto,
          d.origem AS devolucao_origem
        FROM chamados c
        LEFT JOIN devolucao d ON d.id = c.devolucao_id
        WHERE ${searchWhere.clause}
      `;

      const params = [...searchWhere.params];

      if (status) {
        sql += ' AND c.status = ?';
        params.push(status);
      }

      if (tipo) {
        sql += ' AND c.tipo = ?';
        params.push(tipo);
      }

      sql += ' ORDER BY c.id DESC LIMIT ? OFFSET ?';
      params.push(pagination.limit, pagination.offset);

      return await DualDatabase.executeOnMainPool(sql, params);
    } catch (error) {
      throw new Error(`Erro ao buscar chamados: ${error.message}`);
    }
  }

  static async count(search = '', status, tipo) {
    try {
      const searchWhere = buildSearchWhere(SEARCH_FIELDS, search);
      let sql = `
        SELECT COUNT(*) as total
        FROM chamados c
        LEFT JOIN devolucao d ON d.id = c.devolucao_id
        WHERE ${searchWhere.clause}
      `;

      const params = [...searchWhere.params];

      if (status) {
        sql += ' AND c.status = ?';
        params.push(status);
      }

      if (tipo) {
        sql += ' AND c.tipo = ?';
        params.push(tipo);
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
        SELECT c.*,
          COALESCE(c.cliente, d.cliente) AS cliente,
          COALESCE(c.origem, d.origem) AS origem,
          d.cliente AS devolucao_cliente,
          d.produto,
          d.origem AS devolucao_origem
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
        throw new Error('Chamado nao encontrado');
      }

      const status = chamadoData.status || atual.status;
      const resolveuAgora = status === 'resolvido' && atual.status !== 'resolvido';

      const sql = `
        UPDATE chamados SET
          tipo = ?,
          devolucao_id = ?,
          cliente = ?,
          origem = ?,
          item_esperado = ?,
          data_previsao = ?,
          problema = ?,
          status = ?,
          acao_tomada = ?,
          email_solicitante = ?,
          email_responsavel = ?,
          acesso_remoto_em = ?,
          observacao = ?,
          resolvido_em = ?
        WHERE id = ?
      `;

      const params = [
        chamadoData.tipo ?? atual.tipo,
        chamadoData.devolucao_id !== undefined ? chamadoData.devolucao_id || null : atual.devolucao_id,
        chamadoData.cliente ?? atual.cliente,
        chamadoData.origem ?? atual.origem,
        chamadoData.item_esperado ?? atual.item_esperado,
        chamadoData.data_previsao !== undefined ? toMysqlDate(chamadoData.data_previsao) : atual.data_previsao,
        chamadoData.problema ?? atual.problema,
        status,
        chamadoData.acao_tomada !== undefined ? chamadoData.acao_tomada : atual.acao_tomada,
        chamadoData.email_solicitante ?? atual.email_solicitante,
        chamadoData.email_responsavel ?? atual.email_responsavel,
        chamadoData.acesso_remoto_em !== undefined
          ? toMysqlDateTime(chamadoData.acesso_remoto_em)
          : atual.acesso_remoto_em,
        chamadoData.observacao ?? atual.observacao,
        resolveuAgora ? todayDateTime() : atual.resolvido_em,
        id,
      ];

      await DualDatabase.executeOnBothPools(sql, params);
      return this.findById(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar chamado: ${error.message}`);
    }
  }

  static async findOpenMatches({ cliente = '', produto = '', codigo = '' } = {}) {
    if (!cliente || normalizeForMatch(cliente).length < 3) {
      return [];
    }

    const rows = await DualDatabase.executeOnMainPool(`
      SELECT *
      FROM chamados
      WHERE status = 'aberto'
        AND tipo = 'acompanhar_devolucao'
      ORDER BY id DESC
      LIMIT 500
    `);

    return rows
      .filter((chamado) => {
        const clienteCombina = isLooseMatch(chamado.cliente, cliente);
        if (!clienteCombina) return false;

        const esperado = chamado.item_esperado || '';
        if (!esperado) return true;

        return isLooseMatch(esperado, produto) || isLooseMatch(esperado, codigo);
      })
      .slice(0, 20);
  }

  static async resolveMatchesForDevolucao(devolucao) {
    const matches = await this.findOpenMatches({
      cliente: devolucao.cliente,
      produto: devolucao.produto,
      codigo: devolucao.codigo,
    });

    const resolved = [];

    for (const chamado of matches) {
      const atualizado = await this.update(chamado.id, {
        status: 'resolvido',
        devolucao_id: devolucao.id,
        acao_tomada: `Fechado automaticamente ao registrar a devolucao #${devolucao.id}.`,
      });
      resolved.push(atualizado);
    }

    return resolved;
  }

  static async delete(id) {
    const atual = await this.findById(id);
    if (!atual) {
      throw new Error('Chamado nao encontrado');
    }

    await DualDatabase.executeOnBothPools('DELETE FROM chamados WHERE id = ?', [id]);
    return true;
  }
}

module.exports = Chamado;
