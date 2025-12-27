const DualDatabase = require('../utils/DualDatabase');

class Kit {
    constructor(data) {
        this.id = data.id;
        this.processador = data.processador;
        this.memoria = data.memoria;
        this.placaMae = data.placaMae;
        this.lacre = data.lacre;
        this.defeito = data.defeito;
        this.observacao = data.observacao;
        this.origem = data.origem;
        this.data = data.data;
        this.responsavel = data.responsavel;
        this.fkDevolucao = data.fkDevolucao;
    }

    static async create(kitData) {
        try {
            const sql = `
                INSERT INTO kit (processador, memoria, placaMae, lacre, defeito, observacao, origem, data, responsavel, fkDevolucao)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                kitData.processador,
                kitData.memoria,
                kitData.placaMae,
                kitData.lacre,
                kitData.defeito,
                kitData.observacao,
                kitData.origem,
                kitData.data || new Date().toISOString().split('T')[0],
                kitData.responsavel,
                kitData.fkDevolucao || null
            ];
            const result = await DualDatabase.executeOnBothPools(sql, params);
            return { id: result.insertId, ...kitData };
        } catch (error) {
            throw new Error(`Erro ao criar kit: ${error.message}`);
        }
    }

    static async findAll({ page, limit, search }) {
        try {
            const offset = (page - 1) * limit;
            const termo = `%${search}%`;
            const sql = `
                SELECT * FROM kit
                WHERE (processador LIKE ? OR memoria LIKE ? OR placaMae LIKE ? OR lacre LIKE ? OR defeito LIKE ? OR observacao LIKE ? OR origem LIKE ? OR responsavel LIKE ?)
                AND saiu_venda = 0
                ORDER BY id DESC
                LIMIT ? OFFSET ?
            `;
            const params = [termo, termo, termo, termo, termo, termo, termo, termo, limit, offset];
            const results = await DualDatabase.queryOnBothPools(sql, params);
            return results;
        } catch (error) {
            throw new Error(`Erro ao buscar kits: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const sql = `SELECT * FROM kit WHERE id = ?`;
            const params = [id];
            const results = await DualDatabase.queryOnBothPools(sql, params);
            return results[0];
        }
        catch (error) {
            throw new Error(`Erro ao buscar kit por ID: ${error.message}`);
        }
    }
    static async update(id, kitData) {
        try {
            const sql = `
                UPDATE kit
                SET processador = ?, memoria = ?, placaMae = ?, lacre = ?, defeito = ?, observacao = ?, origem = ?, data = ?, responsavel = ?, fkDevolucao = ?
                WHERE id = ?
            `;
            const params = [
                kitData.processador,
                kitData.memoria,
                kitData.placaMae,
                kitData.lacre,
                kitData.defeito,
                kitData.observacao,
                kitData.origem,
                kitData.data,
                kitData.responsavel,
                kitData.fkDevolucao || null,
                id
            ];
            await DualDatabase.executeOnBothPools(sql, params);
            return { id, ...kitData };
        } catch (error) {
            throw new Error(`Erro ao atualizar kit: ${error.message}`);
        }
    }

    //Altera saiu_venda para 1 e data_saida para a data atual
    static async delete(id) {
        try {
            const sql = `UPDATE kit SET saiu_venda = 1, data_saida = NOW() WHERE id = ?`;
            const params = [id];
            await DualDatabase.executeOnBothPools(sql, params);
            return;
        } catch (error) {
            throw new Error(`Erro ao deletar kit: ${error.message}`);
        }
    }

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

module.exports = Kit;