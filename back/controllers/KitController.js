const Kit = require('../models/Kit');

class KitController {
  // Criar um novo kit
  static async create(req, res) {
    try {
      const kitData = req.body;
      
      // Validação básica
      if (!kitData.processador || !kitData.responsavel) {
        return res.status(400).json({
          error: 'Processador e responsável são obrigatórios'
        });
      }

      const kit = await Kit.create(kitData);
      
      return res.status(201).json({
        message: 'Kit criado com sucesso!',
        data: kit
      });
    } catch (error) {
      console.error('Erro ao criar kit:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Listar todos os kits com paginação e busca
  static async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      
      const paginatedResults = await Kit.findAll({
        page: parseInt(page),
        limit: parseInt(limit),
        search: search.toString()
      });

      // Buscar total para cálculo de páginas
      const countSql = `
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
        ) AND saiu_venda = 0
      `;
      const termo = `%${search}%`;
      const countParams = [termo, termo, termo, termo, termo, termo, termo, termo];
      
      // Aqui você precisará ajustar de acordo com sua implementação do DualDatabase
      const totalResult = await DualDatabase.queryOnMainPool(countSql, countParams);
      const total = totalResult[0]?.total || 0;
      const totalPaginas = Math.ceil(total / parseInt(limit));

      return res.json({
        dados: paginatedResults,
        total,
        totalPaginas,
        paginaAtual: parseInt(page),
        limite: parseInt(limit)
      });
    } catch (error) {
      console.error('Erro ao buscar kits:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Buscar kit por ID
  static async findById(req, res) {
    try {
      const { id } = req.params;
      
      const kit = await Kit.findById(parseInt(id));
      
      if (!kit) {
        return res.status(404).json({
          error: 'Kit não encontrado'
        });
      }

      return res.json({
        data: kit
      });
    } catch (error) {
      console.error('Erro ao buscar kit:', error);
      return res.status(500).json({
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

      // Verificar se o kit existe
      const existingKit = await Kit.findById(parseInt(id));
      if (!existingKit) {
        return res.status(404).json({
          error: 'Kit não encontrado'
        });
      }

      const updatedKit = await Kit.update(parseInt(id), kitData);
      
      return res.json({
        message: 'Kit atualizado com sucesso!',
        data: updatedKit
      });
    } catch (error) {
      console.error('Erro ao atualizar kit:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Deletar kit (marcar como saiu_venda = 1)
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar se o kit existe
      const existingKit = await Kit.findById(parseInt(id));
      if (!existingKit) {
        return res.status(404).json({
          error: 'Kit não encontrado'
        });
      }

      await Kit.delete(parseInt(id));
      
      return res.json({
        message: 'Kit removido com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao deletar kit:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Buscar kits do dia atual
  static async findToday(req, res) {
    try {
      const sql = `
        SELECT * 
        FROM kit 
        WHERE DATE(data) = CURDATE() 
        AND saiu_venda = 0
        ORDER BY id DESC
      `;
      
      const kits = await DualDatabase.queryOnMainPool(sql);
      
      return res.json({
        data: kits,
        total: kits.length
      });
    } catch (error) {
      console.error('Erro ao buscar kits do dia:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Exportar relatório em Excel (kits do dia)
  static async exportExcelToday(req, res) {
    try {
      const { data } = req.query;
      const targetDate = data || new Date().toISOString().split('T')[0];
      
      const sql = `
        SELECT 
          id,
          processador,
          memoria,
          placaMae,
          lacre,
          defeito,
          observacao,
          origem,
          data,
          responsavel,
          fkDevolucao
        FROM kit 
        WHERE DATE(data) = ? 
        AND saiu_venda = 0
        ORDER BY id DESC
      `;
      
      const kits = await DualDatabase.queryOnMainPool(sql, [targetDate]);
      
      // Aqui você implementaria a geração do Excel
      // Por enquanto, retornamos JSON
      return res.json({
        message: 'Relatório gerado com sucesso',
        data: kits,
        total: kits.length,
        date: targetDate
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Relatório SKU para Paulinho (kits do dia)
  static async relatorioPaulinho(req, res) {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      
      const sql = `
        SELECT 
          processador,
          COUNT(*) as quantidade,
          GROUP_CONCAT(id SEPARATOR ', ') as ids
        FROM kit 
        WHERE DATE(data) = ? 
        AND saiu_venda = 0
        GROUP BY processador
        ORDER BY processador
      `;
      
      const resultado = await DualDatabase.queryOnMainPool(sql, [hoje]);
      
      return res.json({
        message: 'Relatório SKU gerado com sucesso',
        data: resultado,
        date: hoje
      });
    } catch (error) {
      console.error('Erro ao gerar relatório SKU:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }

  // Estatísticas para dashboard
  static async getStats(req, res) {
    try {
      const statsSql = `
        SELECT 
          COUNT(*) as totalKits,
          COUNT(CASE WHEN DATE(data) = CURDATE() THEN 1 END) as kitsHoje,
          COUNT(CASE WHEN defeito = 'Sim' OR defeito = 'sim' OR defeito = 1 THEN 1 END) as kitsComDefeito,
          origem,
          COUNT(*) as quantidadePorOrigem
        FROM kit 
        WHERE saiu_venda = 0
        GROUP BY origem
      `;
      
      const stats = await DualDatabase.queryOnMainPool(statsSql);
      
      const totalStats = {
        totalKits: stats.reduce((acc, item) => acc + (item.totalKits || 0), 0),
        kitsHoje: stats.reduce((acc, item) => acc + (item.kitsHoje || 0), 0),
        kitsComDefeito: stats.reduce((acc, item) => acc + (item.kitsComDefeito || 0), 0),
        distribuicaoPorOrigem: stats.map(item => ({
          origem: item.origem,
          quantidade: item.quantidadePorOrigem
        }))
      };
      
      return res.json({
        stats: totalStats
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({
        error: 'Erro interno do servidor',
        details: error.message
      });
    }
  }
}

module.exports = KitController;