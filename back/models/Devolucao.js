const DualDatabase = require('../middleware/dualDatabase');
const { buildSearchWhere, getPagination } = require('../utils/search');

const SEARCH_FIELDS = [
    'origem',
    'cliente',
    'produto',
    'codigo',
    'observacao',
    'CAST(id AS CHAR)',
    "DATE_FORMAT(data, '%d/%m/%Y %H:%i:%s')",
];

class Devolucao {
    constructor(data) {
        this.id = data.id;
        this.origem = data.origem;
        this.cliente = data.cliente;
        this.produto = data.produto;
        this.codigo = data.codigo;
        this.observacao = data.observacao;
        this.imagem = data.imagem;
        this.data = data.data;
    }

    // Criar nova devolução
    static async create(devolucaoData) {
        try {
            const sql = `
                INSERT INTO devolucao (origem, cliente, produto, codigo, observacao, imagem, data)
                VALUES (?, ?, ?, ?, ?, ?, NOW())
            `;
            const params = [
                devolucaoData.origem,
                devolucaoData.cliente,
                devolucaoData.produto,
                devolucaoData.codigo || '',
                devolucaoData.observacao || '',
                devolucaoData.imagem || ''
            ];
            
            const result = await DualDatabase.insertOnBothPools(sql, params);
            return { 
                id: result.insertId, 
                ...devolucaoData 
            };
        } catch (error) {
            throw new Error(`Erro ao criar devolução: ${error.message}`);
        }
    }

    // Buscar todas as devoluções
    static async findAll({ page = 1, limit = 10, search = '' }) {
        try {
            const pagination = getPagination({ page, limit });
            const searchWhere = buildSearchWhere(SEARCH_FIELDS, search);
            
            const sql = `
                SELECT * FROM devolucao
                WHERE ${searchWhere.clause}
                ORDER BY id DESC
                LIMIT ? OFFSET ?
            `;
            
            const params = [...searchWhere.params, pagination.limit, pagination.offset];
            const rows = await DualDatabase.executeOnMainPool(sql, params);
            
            return rows;
        } catch (error) {
            throw new Error(`Erro ao buscar devoluções: ${error.message}`);
        }
    }

    // Contar total
    static async count(search = '') {
        try {
            const searchWhere = buildSearchWhere(SEARCH_FIELDS, search);
            const sql = `
                SELECT COUNT(*) as total 
                FROM devolucao
                WHERE ${searchWhere.clause}
            `;
            
            const result = await DualDatabase.count(sql, searchWhere.params);
            return result.total || 0;
        } catch (error) {
            throw new Error(`Erro ao contar devoluções: ${error.message}`);
        }
    }

    // Buscar por ID
    static async findById(id) {
        try {
            const sql = `SELECT * FROM devolucao WHERE id = ?`;
            const rows = await DualDatabase.executeOnMainPool(sql, [id]);
            
            if (rows.length === 0) {
                return null;
            }
            
            return new Devolucao(rows[0]);
        } catch (error) {
            throw new Error(`Erro ao buscar devolução: ${error.message}`);
        }
    }

    // Atualizar devolução
    static async update(id, devolucaoData) {
        try {
            const devolucao = await this.findById(id);
            if (!devolucao) {
                throw new Error('Devolução não encontrada');
            }

            const sql = `
                UPDATE devolucao SET
                    origem = ?,
                    cliente = ?,
                    produto = ?,
                    codigo = ?,
                    observacao = ?,
                    imagem = ?,
                    data = NOW()
                WHERE id = ?
            `;

            const params = [
                devolucaoData.origem ?? devolucao.origem,
                devolucaoData.cliente ?? devolucao.cliente,
                devolucaoData.produto ?? devolucao.produto,
                devolucaoData.codigo ?? devolucao.codigo,
                devolucaoData.observacao ?? devolucao.observacao,
                devolucaoData.imagem ?? devolucao.imagem,
                id
            ];

            await DualDatabase.executeOnBothPools(sql, params);
            return await this.findById(id);
        } catch (error) {
            throw new Error(`Erro ao atualizar devolução: ${error.message}`);
        }
    }

    // Excluir devolução
    static async delete(id) {
        try {
            const sql = `DELETE FROM devolucao WHERE id = ?`;
            await DualDatabase.executeOnBothPools(sql, [id]);
            return true;
        } catch (error) {
            throw new Error(`Erro ao excluir devolução: ${error.message}`);
        }
    }

    // Buscar devoluções do dia
    static async findToday() {
        try {
            const sql = `
                SELECT * FROM devolucao
                WHERE DATE(data) = CURDATE()
                ORDER BY id DESC
            `;
            
            const rows = await DualDatabase.executeOnMainPool(sql);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao buscar devoluções do dia: ${error.message}`);
        }
    }

    // Estatísticas
    static async getStats() {
        try {
            const sqlStats = `
                SELECT 
                    origem,
                    COUNT(*) as quantidade
                FROM devolucao
                WHERE data >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY origem
                ORDER BY quantidade DESC
            `;
            
            const stats = await DualDatabase.executeOnMainPool(sqlStats);
            
            const sqlTotal = `SELECT COUNT(*) as total FROM devolucao`;
            const totalResult = await DualDatabase.executeOnMainPool(sqlTotal);
            
            const sqlHoje = `SELECT COUNT(*) as hoje FROM devolucao WHERE DATE(data) = CURDATE()`;
            const hojeResult = await DualDatabase.executeOnMainPool(sqlHoje);
            
            return {
                total: totalResult[0]?.total || 0,
                hoje: hojeResult[0]?.hoje || 0,
                porOrigem: stats
            };
        } catch (error) {
            throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
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
                SELECT 
                    id,
                    origem,
                    cliente,
                    produto,
                    codigo,
                    observacao,
                    imagem,
                    DATE_FORMAT(data, '%d/%m/%Y %H:%i:%s') as data_formatada
                FROM devolucao
                WHERE DATE(data) BETWEEN ? AND ?
                ORDER BY id DESC
            `;
            
            const rows = await DualDatabase.executeOnMainPool(sql, [inicio.toISOString().slice(0, 10), fim.toISOString().slice(0, 10)]);
            return rows;
        } catch (error) {
            throw new Error(`Erro ao gerar relatório semanal: ${error.message}`);
        }
    }

    static async getReportByPeriod(inicio, fim) {
        try {
            const sql = `
                SELECT
                    id,
                    origem,
                    cliente,
                    produto,
                    codigo,
                    observacao,
                    imagem,
                    DATE_FORMAT(data, '%d/%m/%Y %H:%i:%s') as data_formatada
                FROM devolucao
                WHERE DATE(data) BETWEEN ? AND ?
                ORDER BY id DESC
            `;

            return await DualDatabase.executeOnMainPool(sql, [inicio, fim]);
        } catch (error) {
            throw new Error(`Erro ao gerar relatorio por periodo: ${error.message}`);
        }
    }

    toJSON() {
        return {
            id: this.id,
            origem: this.origem,
            cliente: this.cliente,
            produto: this.produto,
            codigo: this.codigo,
            observacao: this.observacao,
            imagem: this.imagem,
            data: this.data
        };
    }
}

module.exports = Devolucao;
