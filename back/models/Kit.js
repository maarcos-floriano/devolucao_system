const DualDatabase = require('../middleware/dualDatabase');

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

    // Criar novo kit
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
            
            const result = await DualDatabase.insertOnBothPools(sql, params);
            return { 
                id: result.insertId, 
                ...kitData 
            };
        } catch (error) {
            throw new Error(`Erro ao criar kit: ${error.message}`);
        }
    }

    // Buscar todos os kits com paginação e busca
    static async findAll({ page, limit, search }) {
        try {
            const offset = (page - 1) * limit;
            const termo = `%${search}%`;
            
            const sql = `
                SELECT * FROM kit
                WHERE (
                    processador LIKE ? OR 
                    memoria LIKE ? OR 
                    placaMae LIKE ? OR 
                    lacre LIKE ? OR 
                    defeito LIKE ? OR 
                    observacao LIKE ? OR 
                    origem LIKE ? OR 
                    responsavel LIKE ? OR
                    id LIKE ?
                )
                AND saiu_venda = 0
                ORDER BY id DESC
                LIMIT ? OFFSET ?
            `;
            const params = [termo, termo, termo, termo, termo, termo, termo, termo, termo, limit, offset];
            
            const rows = await DualDatabase.executeOnMainPool(sql, params);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao buscar kits: ${error.message}`);
        }
    }

    // Contar total de kits para paginação
    static async count(search = '') {
        try {
            const termo = `%${search}%`;
            const sql = `
                SELECT COUNT(*) as total 
                FROM kit 
                WHERE (
                    processador LIKE ? OR 
                    memoria LIKE ? OR 
                    placaMae LIKE ? OR 
                    lacre LIKE ? OR 
                    defeito LIKE ? OR 
                    observacao LIKE ? OR 
                    origem LIKE ? OR 
                    responsavel LIKE ?
                )
                AND saiu_venda = 0
            `;
            const params = [termo, termo, termo, termo, termo, termo, termo, termo];
            
            const result = await DualDatabase.count(sql, params);
            return result.total || 0;
        } catch (error) {
            throw new Error(`Erro ao contar kits: ${error.message}`);
        }
    }

    // Buscar kit por ID
    static async findById(id) {
        try {
            const sql = `SELECT * FROM kit WHERE id = ? AND saiu_venda = 0`;
            const rows = await DualDatabase.executeOnMainPool(sql, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Kit(rows[0]);
        } catch (error) {
            throw new Error(`Erro ao buscar kit por ID: ${error.message}`);
        }
    }

    // Atualizar kit
    static async update(id, kitData) {
        try {
            const kit = await this.findById(id);
            if (!kit) {
                throw new Error('Kit não encontrado');
            }

            const sql = `
                UPDATE kit
                SET processador = ?, 
                    memoria = ?, 
                    placaMae = ?, 
                    lacre = ?, 
                    defeito = ?, 
                    observacao = ?, 
                    origem = ?, 
                    data = NOW(), 
                    responsavel = ?, 
                    fkDevolucao = ?
                WHERE id = ?
            `;
            const params = [
                kitData.processador || kit.processador,
                kitData.memoria || kit.memoria,
                kitData.placaMae || kit.placaMae,
                kitData.lacre || kit.lacre,
                kitData.defeito || kit.defeito,
                kitData.observacao || kit.observacao,
                kitData.origem || kit.origem,
                kitData.responsavel || kit.responsavel,
                kitData.fkDevolucao || kit.fkDevolucao,
                id
            ];

            await DualDatabase.executeOnBothPools(sql, params);
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Erro ao atualizar kit: ${error.message}`);
        }
    }

    // Excluir kit (marcar como saiu_venda = 1)
    static async delete(id) {
        try {
            const sql = `UPDATE kit SET saiu_venda = 1, data_saida = NOW() WHERE id = ?`;
            await DualDatabase.executeOnBothPools(sql, [id]);
            return true;
        } catch (error) {
            throw new Error(`Erro ao excluir kit: ${error.message}`);
        }
    }

    // Buscar kits do dia
    static async findToday() {
        try {
            const sql = `
                SELECT * FROM kit
                WHERE DATE(data) = CURDATE()
                AND saiu_venda = 0
                ORDER BY id DESC
            `;
            const rows = await DualDatabase.executeOnMainPool(sql);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao buscar kits do dia: ${error.message}`);
        }
    }

    // Relatório semanal (últimos 7 dias)
    static async getDailyReport(dateFim) {
        try {
            const fim = dateFim ? new Date(dateFim) : new Date();
            if (Number.isNaN(fim.getTime())) {
                throw new Error('Data final inválida');
            }

            const inicio = new Date(fim);
            inicio.setDate(fim.getDate() - 6);

            const sql = `
                SELECT * FROM kit
                WHERE DATE(data) BETWEEN ? AND ?
                AND saiu_venda = 0
                ORDER BY id DESC
            `;
            const rows = await DualDatabase.executeOnMainPool(sql, [inicio.toISOString().slice(0, 10), fim.toISOString().slice(0, 10)]);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao gerar relatório semanal: ${error.message}`);
        }
    }

    // Relatório SKU para Paulinho
    static async getSkuReport() {
        try {
            const fim = new Date();
            const inicio = new Date(fim);
            inicio.setDate(fim.getDate() - 6);
            const sql = `
                SELECT 
                    processador,
                    COUNT(*) as quantidade,
                    GROUP_CONCAT(id SEPARATOR ', ') as ids
                FROM kit 
                WHERE DATE(data) BETWEEN ? AND ? 
                AND saiu_venda = 0
                GROUP BY processador
                ORDER BY processador
            `;
            const rows = await DualDatabase.executeOnMainPool(sql, [inicio.toISOString().slice(0, 10), fim.toISOString().slice(0, 10)]);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao gerar relatório SKU: ${error.message}`);
        }
    }

    // Estatísticas
    static async getStats() {
        try {
            const sql = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN DATE(data) = CURDATE() THEN 1 END) as hoje,
                    COUNT(CASE WHEN defeito = 'Sim' OR defeito = 'sim' OR defeito = 1 THEN 1 END) as comDefeito,
                    origem,
                    COUNT(*) as porOrigem
                FROM kit 
                WHERE saiu_venda = 0
                GROUP BY origem
            `;
            const rows = await DualDatabase.executeOnMainPool(sql);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
        }
    }

    toJSON() {
        return {
            id: this.id,
            processador: this.processador,
            memoria: this.memoria,
            placaMae: this.placaMae,
            lacre: this.lacre,
            defeito: this.defeito,
            observacao: this.observacao,
            origem: this.origem,
            data: this.data,
            responsavel: this.responsavel,
            fkDevolucao: this.fkDevolucao
        };
    }
}

module.exports = Kit;