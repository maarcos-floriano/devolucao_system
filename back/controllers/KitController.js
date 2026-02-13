// controllers/KitController.js (FINAL)
const Kit = require('../models/Kit');

class KitController {
    // Criar novo kit
    static async create(req, res) {
        try {
            const kitData = req.body;
            
            if (!kitData.processador || !kitData.responsavel) {
                return res.status(400).json({
                    success: false,
                    error: 'Processador e responsável são obrigatórios'
                });
            }

            const kit = await Kit.create(kitData);
            
            return res.status(201).json({
                success: true,
                message: 'Kit criado com sucesso!',
                data: kit
            });
        } catch (error) {
            console.error('Erro ao criar kit:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Listar kits
    static async findAll(req, res) {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            
            const [dados, total] = await Promise.all([
                Kit.findAll({
                    page: parseInt(page),
                    limit: parseInt(limit),
                    search: search.toString()
                }),
                Kit.count(search.toString())
            ]);

            const totalPaginas = Math.ceil(total / parseInt(limit));

            return res.json({
                success: true,
                dados,
                total,
                totalPaginas,
                paginaAtual: parseInt(page),
                limite: parseInt(limit)
            });
        } catch (error) {
            console.error('Erro ao buscar kits:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Buscar por ID
    static async findById(req, res) {
        try {
            const { id } = req.params;
            const kit = await Kit.findById(parseInt(id));
            
            if (!kit) {
                return res.status(404).json({
                    success: false,
                    error: 'Kit não encontrado'
                });
            }

            return res.json({
                success: true,
                data: kit
            });
        } catch (error) {
            console.error('Erro ao buscar kit:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Atualizar kit
    static async update(req, res) {
        try {
            const { id } = req.params;
            const kitData = req.body;

            const kitExistente = await Kit.findById(parseInt(id));
            if (!kitExistente) {
                return res.status(404).json({
                    success: false,
                    error: 'Kit não encontrado'
                });
            }

            const kitAtualizado = await Kit.update(parseInt(id), kitData);
            
            return res.json({
                success: true,
                message: 'Kit atualizado com sucesso!',
                data: kitAtualizado
            });
        } catch (error) {
            console.error('Erro ao atualizar kit:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Excluir kit
    static async delete(req, res) {
        try {
            const { id } = req.params;
            
            const kitExistente = await Kit.findById(parseInt(id));
            if (!kitExistente) {
                return res.status(404).json({
                    success: false,
                    error: 'Kit não encontrado'
                });
            }

            await Kit.delete(parseInt(id));
            
            return res.json({
                success: true,
                message: 'Kit excluído com sucesso!'
            });
        } catch (error) {
            console.error('Erro ao excluir kit:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Kits do dia
    static async findToday(req, res) {
        try {
            const kits = await Kit.findToday();
            
            return res.json({
                success: true,
                data: kits,
                total: kits.length
            });
        } catch (error) {
            console.error('Erro ao buscar kits do dia:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Relatório Excel
    static async exportExcelToday(req, res) {
        try {
            const { data } = req.query;
            const relatorio = await Kit.getDailyReport(data);
            
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

    // Relatório SKU Paulinho
    static async relatorioPaulinho(req, res) {
        try {
            const relatorio = await Kit.getSkuReport();
            
            return res.json({
                success: true,
                message: 'Relatório SKU gerado com sucesso',
                data: relatorio
            });
        } catch (error) {
            console.error('Erro ao gerar relatório SKU:', error);
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }

    // Estatísticas
    static async getStats(req, res) {
        try {
            const stats = await Kit.getStats();
            
            const totalStats = {
                total: stats.reduce((acc, item) => acc + (item.total || 0), 0),
                hoje: stats.reduce((acc, item) => acc + (item.hoje || 0), 0),
                comDefeito: stats.reduce((acc, item) => acc + (item.comDefeito || 0), 0),
                distribuicaoPorOrigem: stats.map(item => ({
                    origem: item.origem,
                    quantidade: item.porOrigem
                }))
            };
            
            return res.json({
                success: true,
                data: totalStats
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
}

module.exports = KitController;