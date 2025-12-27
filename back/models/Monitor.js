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
      (marca, tamanho, quantidade, rma, data, responsavel)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      monitorData.marca,
      monitorData.tamanho,
      monitorData.quantidade || 1,
      monitorData.rma || false,
      monitorData.data || new Date().toISOString().split('T')[0],
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
  static async findAll(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const sql = `SELECT * FROM monitores ORDER BY id DESC LIMIT ? OFFSET ?`;
      const [rows] = await DualDatabase.executeOnMainPool(sql, [limit, offset]);
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
      
      const [rows] = await DualDatabase.executeOnMainPool(sql);
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