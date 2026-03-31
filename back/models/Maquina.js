const DualDatabase = require('../middleware/dualDatabase');

class Maquina {
  constructor(data) {
    this.id = data.id;
    this.codigo = data.codigo;
    this.config = data.config;
  }

  static async create(maquinaData) {
    const sql = `INSERT INTO maquinas (codigo, config) VALUES (?, ?)`;
    const params = [maquinaData.codigo, maquinaData.config];

    try {
      const result = await DualDatabase.executeOnBothPools(sql, params);
      return { id: result.insertId, ...maquinaData };
    } catch (error) {
      throw new Error(`Erro ao criar máquina: ${error.message}`);
    }
  }

  static async findAll({ page, limit, search }) {
    try {
      const offset = (page - 1) * limit;
      const termo = `%${search}%`;

      const sql = `
        SELECT *
        FROM maquinas
        WHERE (
          codigo LIKE ?
          OR config LIKE ?
          OR id LIKE ?
        )
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `;

      const params = [termo, termo, termo, Number(limit), Number(offset)];
      const rows = await DualDatabase.executeOnMainPool(sql, params);
      return rows || [];
    } catch (error) {
      throw new Error(`Erro ao buscar máquinas: ${error.message}`);
    }
  }

  static async findToday() {
    return [];
  }

  static async findById(id) {
    try {
      const sql = `SELECT * FROM maquinas WHERE id = ?`;
      const rows = await DualDatabase.executeOnMainPool(sql, [id]);
      if (rows.length === 0) return null;
      return new Maquina(rows[0]);
    } catch (error) {
      throw new Error(`Erro ao buscar máquina: ${error.message}`);
    }
  }

  static async update(id, maquinaData) {
    try {
      const maquina = await this.findById(id);
      if (!maquina) throw new Error('Máquina não encontrada');

      const sql = `UPDATE maquinas SET codigo = ?, config = ? WHERE id = ?`;
      const params = [
        maquinaData.codigo || maquina.codigo,
        maquinaData.config || maquina.config,
        id,
      ];

      await DualDatabase.executeOnBothPools(sql, params);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar máquina: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const sql = `DELETE FROM maquinas WHERE id = ?`;
      await DualDatabase.executeOnBothPools(sql, [id]);
      return true;
    } catch (error) {
      throw new Error(`Erro ao excluir máquina: ${error.message}`);
    }
  }

  static async count(search) {
    try {
      const termo = `%${search}%`;
      const sql = `
        SELECT COUNT(*) AS total
        FROM maquinas
        WHERE (
          codigo LIKE ?
          OR config LIKE ?
          OR id LIKE ?
        )
      `;

      const rows = await DualDatabase.executeOnMainPool(sql, [termo, termo, termo]);
      return rows[0].total || 0;
    } catch (error) {
      throw new Error(`Erro ao contar máquinas: ${error.message}`);
    }
  }

  toJSON() {
    return {
      id: this.id,
      codigo: this.codigo,
      config: this.config,
    };
  }
}

module.exports = Maquina;
