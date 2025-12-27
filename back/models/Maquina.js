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
    this.responsavel = data.responsavel;
    this.fkDevolucao = data.fkDevolucao;
  }

  // Criar nova máquina
  static async create(maquinaData) {
    const sql = `
      INSERT INTO maquinas 
      (processador, memoria, armazenamento, fonte, origem, observacao, defeito, lacre, data, responsavel, fkDevolucao)
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
      maquinaData.responsavel,
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
  static async findAll({ page, limit, search }) {
    try {
      const offset = (page - 1) * limit;
      const termo = `%${search}%`;

      const sql = `
        SELECT *
        FROM maquinas
        WHERE (
          processador LIKE ?
          OR memoria LIKE ?
          OR armazenamento LIKE ?
          OR origem LIKE ?
          OR responsavel LIKE ?
          OR defeito LIKE ?
          OR observacao LIKE ?
          OR data LIKE ?
          OR fkDevolucao LIKE ?
        )
        AND saiu_venda = 0
        ORDER BY id DESC
        LIMIT ? OFFSET ?
      `;

      // ✅ CORRETO: Todos os parâmetros como placeholders
      const params = [
        termo, // processador
        termo, // memoria
        termo, // armazenamento
        termo, // origem
        termo, // responsavel
        termo, // defeito
        termo, // observacao
        termo, // data
        termo, // fkDevolucao
        Number(limit), // LIMIT como número
        Number(offset) // OFFSET como número
      ];

      const [rows] = await DualDatabase.executeOnMainPool(sql, params);
      
      return rows || [];
    } catch (error) {
      console.error('Erro detalhado em findAll:', error);
      throw new Error(`Erro ao buscar máquinas: ${error.message}`);
    }
  }

  // Buscar máquinas do dia
  static async findToday() {
    try {
      const sql = `
        SELECT *
        FROM maquinas
        WHERE DATE(data) = CURDATE()
        AND saiu_venda = 0
      `;

      const [rows] = await DualDatabase.executeOnMainPool(sql);
      return rows;
    } catch (error) {
      throw new Error(`Erro ao buscar máquinas do dia: ${error.message}`);
    }
  }

  // Buscar por ID
  static async findById(id) {
    try {
      const sql = `SELECT * FROM maquinas WHERE id = ? AND saiu_venda = 0`;
      const rows = await DualDatabase.executeOnMainPool(sql, [id]);

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
          responsavel = ?,
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
        maquinaData.responsavel || maquina.responsavel,
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
      const sql = `UPDATE maquinas SET saiu_venda = 1, data_saida_venda = NOW() WHERE id = ?`;
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
      responsavel: this.responsavel,
      fkDevolucao: this.fkDevolucao
    };
  }
}

module.exports = Maquina;