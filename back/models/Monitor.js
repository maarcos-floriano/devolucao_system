const DualDatabase = require('../middleware/dualDatabase');
const { buildSearchWhere, getPagination } = require('../utils/search');

const SEARCH_FIELDS = [
  'marca',
  'tamanho',
  'origem',
  'observacao',
  'responsavel',
  'CAST(id AS CHAR)',
  'CAST(fkDevolucao AS CHAR)',
  "DATE_FORMAT(data, '%d/%m/%Y')",
];

class Monitor {
  constructor(data) {
    this.id = data.id;
    this.marca = data.marca;
    this.tamanho = data.tamanho;
    this.origem = data.origem;
    this.rma = Boolean(data.rma);
    this.data = data.data;
    this.observacao = data.observacao;
    this.responsavel = data.responsavel;
    this.fkDevolucao = data.fkDevolucao;
  }

  static async create(monitorData) {
    const sql = `
      INSERT INTO monitores
      (marca, tamanho, origem, rma, data, observacao, responsavel, fkDevolucao)
      VALUES (?, ?, ?, ?, NOW(), ?, ?, ?)
    `;

    const params = [
      monitorData.marca,
      monitorData.tamanho,
      monitorData.origem || '',
      monitorData.rma || false,
      monitorData.observacao || null,
      monitorData.responsavel,
      monitorData.fkDevolucao || null,
    ];

    try {
      const result = await DualDatabase.executeOnBothPools(sql, params);
      return { id: result.insertId, ...monitorData };
    } catch (error) {
      throw new Error(`Erro ao criar monitor: ${error.message}`);
    }
  }

  static async findAll({ page, limit, search }) {
    try {
      const pagination = getPagination({ page, limit });
      const searchWhere = buildSearchWhere(SEARCH_FIELDS, search);
      const sql = `
        SELECT *
        FROM monitores
        WHERE ${searchWhere.clause}
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `;

      return await DualDatabase.executeOnMainPool(sql, [
        ...searchWhere.params,
        pagination.limit,
        pagination.offset,
      ]);
    } catch (error) {
      throw new Error(`Erro ao buscar monitores: ${error.message}`);
    }
  }

  static async findToday() {
    try {
      const sql = `
        SELECT *
        FROM monitores
        WHERE DATE(data) = CURDATE()
        ORDER BY id DESC
      `;

      return await DualDatabase.executeOnMainPool(sql);
    } catch (error) {
      throw new Error(`Erro ao buscar monitores do dia: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const rows = await DualDatabase.executeOnMainPool('SELECT * FROM monitores WHERE id = ?', [id]);
      return rows.length ? new Monitor(rows[0]) : null;
    } catch (error) {
      throw new Error(`Erro ao buscar monitor: ${error.message}`);
    }
  }

  static async count(search) {
    try {
      const searchWhere = buildSearchWhere(SEARCH_FIELDS, search);
      const sql = `SELECT COUNT(*) AS count FROM monitores WHERE ${searchWhere.clause}`;
      const rows = await DualDatabase.executeOnMainPool(sql, searchWhere.params);
      return rows[0].count || 0;
    } catch (error) {
      throw new Error(`Erro ao contar monitores: ${error.message}`);
    }
  }

  static async update(id, monitorData) {
    const atual = await this.findById(id);
    if (!atual) {
      return null;
    }

    const sql = `
      UPDATE monitores
      SET marca = ?, tamanho = ?, origem = ?, rma = ?, data = NOW(), observacao = ?, responsavel = ?, fkDevolucao = ?
      WHERE id = ?
    `;

    const params = [
      monitorData.marca ?? atual.marca,
      monitorData.tamanho ?? atual.tamanho,
      monitorData.origem ?? atual.origem,
      monitorData.rma ?? atual.rma,
      monitorData.observacao ?? atual.observacao,
      monitorData.responsavel ?? atual.responsavel,
      monitorData.fkDevolucao ?? atual.fkDevolucao,
      id,
    ];

    try {
      await DualDatabase.executeOnBothPools(sql, params);
      return this.findById(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar monitor: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      await DualDatabase.executeOnBothPools('DELETE FROM monitores WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar monitor: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      marca: this.marca,
      tamanho: this.tamanho,
      origem: this.origem,
      rma: this.rma,
      data: this.data,
      observacao: this.observacao,
      responsavel: this.responsavel,
      fkDevolucao: this.fkDevolucao,
    };
  }
}

module.exports = Monitor;
