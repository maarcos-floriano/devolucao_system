const DualDatabase = require('../middleware/dualDatabase');

class Monitor {
  constructor(data) {
    this.id = data.id;
    this.marca = data.marca;
    this.tamanho = data.tamanho;
    this.quantidade = data.quantidade;
    this.rma = Boolean(data.rma);
    this.data = data.data;
    this.responsavel = data.responsavel;
  }

  // Criar novo monitor
  static async create(monitorData) {
    const sql = `
      INSERT INTO monitores 
      (marca, tamanho, rma, data, observacao, responsavel)
      VALUES (?, ?, ?, NOW(), ?, ?)
    `;
    
    const params = [
      monitorData.marca,
      monitorData.tamanho,
      monitorData.rma || false,
      monitorData.observacao || null,
      monitorData.responsavel
    ];

    try {
      const result = await DualDatabase.executeOnBothPools(sql, params);
      return { id: result.insertId, ...monitorData };
    } catch (error) {
      throw new Error(`Erro ao criar monitor: ${error.message}`);
    }
  }

  // Buscar todos os monitores
  static async findAll({ page, limit, search }) {
    try {
      const offset = (page - 1) * limit;
      const termo = `%${search}%`;

      const sql = `SELECT * FROM monitores WHERE marca LIKE ? OR tamanho LIKE ? ORDER BY id DESC LIMIT ? OFFSET ?`;
      const rows = await DualDatabase.executeOnMainPool(sql, [termo, termo, limit, offset]);
      return rows;
    } catch (error) {
      throw new Error(`Erro ao buscar monitores: ${error.message}`);
    }
  }

  // Buscar monitores do dia
  static async findToday() {
    try {
      const sql = `
        SELECT * FROM monitores
        WHERE DATE(data) = CURDATE()
        ORDER BY id DESC
      `;
      
      const rows = await DualDatabase.executeOnMainPool(sql);
      return rows;
    } catch (error) {
      throw new Error(`Erro ao buscar monitores do dia: ${error.message}`);
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const sql = `SELECT * FROM monitores WHERE id = ?`;
      const rows = await DualDatabase.executeOnMainPool(sql, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Monitor(rows[0]);
    } catch (error) {
      throw new Error(`Erro ao buscar monitor: ${error.message}`);
    }
  }

  //Count
  static async count(search) {
    try {
      const termo = `%${search}%`;
      const sql = `SELECT COUNT(*) AS count FROM monitores WHERE marca LIKE ? OR tamanho LIKE ?`;
      const rows = await DualDatabase.executeOnMainPool(sql, [termo, termo]);
      return rows[0].count;
    } catch (error) {
      throw new Error(`Erro ao contar monitores: ${error.message}`);
    }
  }

  // Atualizar monitor
  static async update(id, monitorData) {
    const sql = `
      UPDATE monitores
      SET marca = ?, tamanho = ?, rma = ?, data = NOW(), responsavel = ?
      WHERE id = ?
    `;
    const params = [
      monitorData.marca,
      monitorData.tamanho,
      monitorData.rma || false,
      monitorData.responsavel,
      id
    ];

    try {
      await DualDatabase.executeOnBothPools(sql, params);
      return { id, ...monitorData };
    } catch (error) {
      throw new Error(`Erro ao atualizar monitor: ${error.message}`);
    }
  }

  // Deletar monitor
  static async delete(id) {
    const sql = `DELETE FROM monitores WHERE id = ?`;

    try {
      await DualDatabase.executeOnBothPools(sql, [id]);
      return true;
    } catch (error) {
      throw new Error(`Erro ao deletar monitor: ${error.message}`);
    } 
  }

  // Método para exportar dados
  toJSON() {
    return {
      id: this.id,
      marca: this.marca,
      tamanho: this.tamanho,
      quantidade: this.quantidade,
      rma: this.rma,
      data: this.data,
      responsavel: this.responsavel
    };
  }
}

module.exports = Monitor;