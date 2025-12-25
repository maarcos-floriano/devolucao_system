const DualDatabase = require('../middleware/dualDatabase');

class Maquina {
  constructor(data) {
    this.id = data.id;
    this.processador = data.processador;
    this.memoria = data.memoria;
    this.armazenamento = data.armazenamento;
    this.fonte = data.fonte;
    this.origem = data.origem;
    this.observacao = data.observacao;
    this.defeito = data.defeito;
    this.lacre = data.lacre;
    this.data = data.data;
    this.responsavelMaquina = data.responsavelMaquina;
    this.fkDevolucao = data.fkDevolucao;
  }

  // Criar nova máquina
  static async create(maquinaData) {
    const sql = `
      INSERT INTO maquinas 
      (processador, memoria, armazenamento, fonte, origem, observacao, defeito, lacre, data, responsavelMaquina, fkDevolucao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      maquinaData.processador,
      maquinaData.memoria,
      maquinaData.armazenamento,
      maquinaData.fonte,
      maquinaData.origem,
      maquinaData.observacao,
      maquinaData.defeito,
      maquinaData.lacre,
      maquinaData.data || new Date().toISOString().split('T')[0],
      maquinaData.responsavelMaquina,
      maquinaData.fkDevolucao || null
    ];

    try {
      const result = await DualDatabase.executeOnBothPools(sql, params);
      return { id: result.insertId, ...maquinaData };
    } catch (error) {
      throw new Error(`Erro ao criar máquina: ${error.message}`);
    }
  }

  // Buscar todas as máquinas com paginação
  static async findAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    const termo = `%${search}%`;

    try {
      const sql = `
        SELECT * FROM maquinas
        WHERE processador LIKE ? 
          OR memoria LIKE ? 
          OR armazenamento LIKE ? 
          OR origem LIKE ? 
          OR responsavelMaquina LIKE ? 
          OR defeito LIKE ? 
          OR observacao LIKE ?
          OR fkDevolucao LIKE ?
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `;

      const countSql = `
        SELECT COUNT(*) AS total FROM maquinas
        WHERE processador LIKE ? 
          OR memoria LIKE ? 
          OR armazenamento LIKE ? 
          OR origem LIKE ? 
          OR responsavelMaquina LIKE ? 
          OR defeito LIKE ? 
          OR observacao LIKE ?
          OR fkDevolucao LIKE ?
      `;

      const [rows] = await DualDatabase.executeOnMainPool(sql, [
        termo, termo, termo, termo, termo, termo, termo, termo,
        parseInt(limit), parseInt(offset)
      ]);

      const [[{ total }]] = await DualDatabase.executeOnMainPool(countSql, [
        termo, termo, termo, termo, termo, termo, termo, termo
      ]);

      return {
        pagina: parseInt(page),
        totalPaginas: Math.ceil(total / limit),
        totalRegistros: total,
        dados: rows.map(row => new Maquina(row))
      };
    } catch (error) {
      throw new Error(`Erro ao buscar máquinas: ${error.message}`);
    }
  }

  // Buscar máquinas do dia
  static async findToday() {
    try {
      const sql = `
        SELECT * FROM maquinas
        WHERE DATE(data) = CURDATE()
        ORDER BY id DESC
      `;
      
      const [rows] = await DualDatabase.executeOnMainPool(sql);
      return rows.map(row => new Maquina(row));
    } catch (error) {
      throw new Error(`Erro ao buscar máquinas do dia: ${error.message}`);
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const sql = `SELECT * FROM maquinas WHERE id = ?`;
      const [rows] = await DualDatabase.executeOnMainPool(sql, [id]);
      
      if (rows.length === 0) {
        return null;
      }
      
      return new Maquina(rows[0]);
    } catch (error) {
      throw new Error(`Erro ao buscar máquina: ${error.message}`);
    }
  }

  // Atualizar máquina
  static async update(id, maquinaData) {
    try {
      const maquina = await this.findById(id);
      if (!maquina) {
        throw new Error('Máquina não encontrada');
      }

      const sql = `
        UPDATE maquinas SET
          processador = ?,
          memoria = ?,
          armazenamento = ?,
          fonte = ?,
          origem = ?,
          observacao = ?,
          defeito = ?,
          lacre = ?,
          data = ?,
          responsavelMaquina = ?,
          fkDevolucao = ?
        WHERE id = ?
      `;

      const params = [
        maquinaData.processador || maquina.processador,
        maquinaData.memoria || maquina.memoria,
        maquinaData.armazenamento || maquina.armazenamento,
        maquinaData.fonte || maquina.fonte,
        maquinaData.origem || maquina.origem,
        maquinaData.observacao || maquina.observacao,
        maquinaData.defeito || maquina.defeito,
        maquinaData.lacre || maquina.lacre,
        maquinaData.data || maquina.data,
        maquinaData.responsavelMaquina || maquina.responsavelMaquina,
        maquinaData.fkDevolucao || maquina.fkDevolucao,
        id
      ];

      await DualDatabase.executeOnBothPools(sql, params);
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Erro ao atualizar máquina: ${error.message}`);
    }
  }

  // Excluir máquina
  static async delete(id) {
    try {
      const sql = `DELETE FROM maquinas WHERE id = ?`;
      await DualDatabase.executeOnBothPools(sql, [id]);
      return true;
    } catch (error) {
      throw new Error(`Erro ao excluir máquina: ${error.message}`);
    }
  }

  // Método para exportar dados
  toJSON() {
    return {
      id: this.id,
      processador: this.processador,
      memoria: this.memoria,
      armazenamento: this.armazenamento,
      fonte: this.fonte,
      origem: this.origem,
      observacao: this.observacao,
      defeito: this.defeito,
      lacre: this.lacre,
      data: this.data,
      responsavelMaquina: this.responsavelMaquina,
      fkDevolucao: this.fkDevolucao
    };
  }
}

module.exports = Maquina;