// controllers/DevolucaoController.js
const Devolucao = require('../models/Devolucao');

const buildImagePath = (file) => {
    if (!file) return '';
    return `/uploads/devolucoes/${file.filename}`;
};

class DevolucaoController {
    // Criar nova devolução
    static async create(req, res) {
        try {
            const { origem, cliente, produto, codigo, observacao } = req.body;
            
            // Validação básica
            if (!origem || !cliente || !produto) {
                return res.status(400).json({
                    success: false,
                    error: 'Origem, cliente e produto são obrigatórios'
                });
            }

            const devolucaoData = {
                origem,
                cliente,
                produto,
                codigo: codigo || '',
                observacao: observacao || '',
                imagem: buildImagePath(req.file)
            };

            const novaDevolucao = await Devolucao.create(devolucaoData);
            
            return res.status(201).json({
                success: true,
                message: 'Devolução registrada com sucesso!',
                data: novaDevolucao
            });
        } catch (error) {
            console.error('Erro ao criar devolução:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Listar todas as devoluções
    static async findAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            
            const [devolucoes, total] = await Promise.all([
                Devolucao.findAll({
                    page: parseInt(page),
                    limit: parseInt(limit),
                    search: search.toString()
                }),
                Devolucao.count(search.toString())
            ]);

            const totalPaginas = Math.ceil(total / parseInt(limit));

            return res.json({
                success: true,
                dados: devolucoes,
                total,
                totalPaginas,
                paginaAtual: parseInt(page),
                limite: parseInt(limit)
            });
        } catch (error) {
            console.error('Erro ao buscar devoluções:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Buscar devolução por ID
    static async findById(req, res) {
        try {
            const { id } = req.params;
            
            const devolucao = await Devolucao.findById(parseInt(id));
            
            if (!devolucao) {
                return res.status(404).json({
                    success: false,
                    error: 'Devolução não encontrada'
                });
            }

            return res.json({
                success: true,
                data: devolucao
            });
        } catch (error) {
            console.error('Erro ao buscar devolução:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Atualizar devolução
    static async update(req, res) {
        try {
            const { id } = req.params;
            const devolucaoData = {
                ...req.body,
            };

            delete devolucaoData.data;
            delete devolucaoData.dataHora;

            if (req.file) {
                devolucaoData.imagem = buildImagePath(req.file);
            }

            const devolucaoAtualizada = await Devolucao.update(parseInt(id), devolucaoData);
            
            if (!devolucaoAtualizada) {
                return res.status(404).json({
                    success: false,
                    error: 'Devolução não encontrada'
                });
            }

            return res.json({
                success: true,
                message: 'Devolução atualizada com sucesso!',
                data: devolucaoAtualizada
            });
        } catch (error) {
            console.error('Erro ao atualizar devolução:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Excluir devolução
    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            const devolucao = await Devolucao.findById(parseInt(id));
            if (!devolucao) {
                return res.status(404).json({
                    success: false,
                    error: 'Devolução não encontrada'
                });
            }

            await Devolucao.delete(parseInt(id));
            
            return res.json({
                success: true,
                message: 'Devolução excluída com sucesso!'
            });
        } catch (error) {
            console.error('Erro ao excluir devolução:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Buscar devoluções do dia
    static async findToday(req, res) {
        try {
            const devolucoesHoje = await Devolucao.findToday();
            
            return res.json({
                success: true,
                data: devolucoesHoje,
                total: devolucoesHoje.length
            });
        } catch (error) {
            console.error('Erro ao buscar devoluções do dia:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Estatísticas para dashboard
    static async getStats(req, res) {
        try {
            const stats = await Devolucao.getStats();
            
            return res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Exportar relatório diário
    static async exportDailyReport(req, res) {
        try {
            const { data } = req.query;
            
            const relatorio = await Devolucao.getDailyReport(data);
            
            // Aqui você pode implementar a geração do Excel
            // Por enquanto, retornamos JSON
            return res.json({
                success: true,
                message: 'Relatório semanal gerado com sucesso',
                data: relatorio,
                total: relatorio.length
            });
        } catch (error) {
            console.error('Erro ao exportar relatório semanal:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Relatório por período
    static async getReportByPeriod(req, res) {
        try {
            const { inicio, fim } = req.query;
            
            if (!inicio || !fim) {
                return res.status(400).json({
                    success: false,
                    error: 'Datas de início e fim são obrigatórias'
                });
            }

            const relatorio = await Devolucao.getReportByPeriod(inicio, fim);
            
            return res.json({
                success: true,
                data: relatorio,
                total: relatorio.length,
                periodo: { inicio, fim }
            });
        } catch (error) {
            console.error('Erro ao gerar relatório por período:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Devoluções por origem (para gráficos)
    static async getByOrigin(req, res) {
        try {
            const { dias = 30 } = req.query;
            
            const sql = `
                SELECT 
                    origem,
                    COUNT(*) as quantidade
                FROM devolucao
                WHERE data >= DATE_SUB(NOW(), INTERVAL ? DAY)
                GROUP BY origem
                ORDER BY quantidade DESC
            `;
            
            // Esta query precisa ser executada diretamente
            // ou você pode adicionar um método específico no model
            const [result] = await require('../utils/DualDatabase').executeOnMainPool(sql, [dias]);
            
            return res.json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('Erro ao buscar devoluções por origem:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
}

module.exports = DevolucaoController;
