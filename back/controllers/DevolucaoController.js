const Devolucao = require('../models/Devolucao');
const Chamado = require('../models/Chamado');
const DualDatabase = require('../middleware/dualDatabase');
const { analyzeLabelImage } = require('../services/labelOcrService');
const emailService = require('../services/emailService');
const { getDevolucaoPublicPath } = require('../config/storage');

const buildImagePath = (file) => {
  if (!file) return '';
  return getDevolucaoPublicPath(file.filename);
};

const getSafeImagePath = (bodyImage) => {
  if (typeof bodyImage !== 'string') return '';
  return bodyImage.startsWith('/uploads/devolucoes/') ? bodyImage : '';
};

class DevolucaoController {
  static async create(req, res) {
    try {
      const { origem, cliente, produto, codigo, observacao } = req.body;

      if (!origem || !cliente || !produto) {
        return res.status(400).json({
          success: false,
          error: 'Origem, cliente e produto sao obrigatorios',
        });
      }

      const devolucaoData = {
        origem,
        cliente,
        produto,
        codigo: codigo || '',
        observacao: observacao || '',
        imagem: buildImagePath(req.file) || getSafeImagePath(req.body.imagem),
      };

      const novaDevolucao = await Devolucao.create(devolucaoData);
      const chamadosFechados = await Chamado.resolveMatchesForDevolucao(novaDevolucao);

      await Promise.allSettled(
        chamadosFechados.map((chamado) => emailService.notifyWatchClosed(chamado, novaDevolucao))
      );

      return res.status(201).json({
        success: true,
        message: 'Devolucao registrada com sucesso!',
        data: {
          ...novaDevolucao,
          chamadosFechados,
        },
      });
    } catch (error) {
      console.error('Erro ao criar devolucao:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message,
      });
    }
  }

  static async analyzeLabel(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'Envie uma imagem da etiqueta para analisar',
        });
      }

      const analysis = await analyzeLabelImage(req.file.path);

      return res.json({
        success: true,
        imagem: buildImagePath(req.file),
        ...analysis,
      });
    } catch (error) {
      console.error('Erro ao analisar etiqueta:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro ao analisar etiqueta',
        details: error.message,
      });
    }
  }

  static async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;

      const [devolucoes, total] = await Promise.all([
        Devolucao.findAll({ page, limit, search: search.toString() }),
        Devolucao.count(search.toString()),
      ]);

      return res.json({
        success: true,
        dados: devolucoes,
        total,
        totalPaginas: Math.ceil(total / Number(limit || 10)),
        paginaAtual: Number(page || 1),
        limite: Number(limit || 10),
      });
    } catch (error) {
      console.error('Erro ao buscar devolucoes:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message,
      });
    }
  }

  static async findById(req, res) {
    try {
      const devolucao = await Devolucao.findById(Number.parseInt(req.params.id, 10));

      if (!devolucao) {
        return res.status(404).json({
          success: false,
          error: 'Devolucao nao encontrada',
        });
      }

      return res.json({ success: true, data: devolucao });
    } catch (error) {
      console.error('Erro ao buscar devolucao:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message,
      });
    }
  }

  static async update(req, res) {
    try {
      const devolucaoData = { ...req.body };

      delete devolucaoData.data;
      delete devolucaoData.dataHora;

      if (req.file) {
        devolucaoData.imagem = buildImagePath(req.file);
      } else if (devolucaoData.imagem) {
        devolucaoData.imagem = getSafeImagePath(devolucaoData.imagem);
      }

      const devolucaoAtualizada = await Devolucao.update(
        Number.parseInt(req.params.id, 10),
        devolucaoData
      );

      if (!devolucaoAtualizada) {
        return res.status(404).json({
          success: false,
          error: 'Devolucao nao encontrada',
        });
      }

      return res.json({
        success: true,
        message: 'Devolucao atualizada com sucesso!',
        data: devolucaoAtualizada,
      });
    } catch (error) {
      console.error('Erro ao atualizar devolucao:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message,
      });
    }
  }

  static async delete(req, res) {
    try {
      const id = Number.parseInt(req.params.id, 10);
      const devolucao = await Devolucao.findById(id);
      if (!devolucao) {
        return res.status(404).json({
          success: false,
          error: 'Devolucao nao encontrada',
        });
      }

      await Devolucao.delete(id);

      return res.json({
        success: true,
        message: 'Devolucao excluida com sucesso!',
      });
    } catch (error) {
      console.error('Erro ao excluir devolucao:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message,
      });
    }
  }

  static async findToday(req, res) {
    try {
      const devolucoesHoje = await Devolucao.findToday();

      return res.json({
        success: true,
        data: devolucoesHoje,
        total: devolucoesHoje.length,
      });
    } catch (error) {
      console.error('Erro ao buscar devolucoes do dia:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message,
      });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await Devolucao.getStats();
      return res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Erro ao buscar estatisticas:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message,
      });
    }
  }

  static async exportDailyReport(req, res) {
    try {
      const relatorio = await Devolucao.getDailyReport(req.query.data);

      return res.json({
        success: true,
        message: 'Relatorio semanal gerado com sucesso',
        data: relatorio,
        total: relatorio.length,
      });
    } catch (error) {
      console.error('Erro ao exportar relatorio semanal:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message,
      });
    }
  }

  static async getReportByPeriod(req, res) {
    try {
      const { inicio, fim } = req.query;

      if (!inicio || !fim) {
        return res.status(400).json({
          success: false,
          error: 'Datas de inicio e fim sao obrigatorias',
        });
      }

      const relatorio = await Devolucao.getReportByPeriod(inicio, fim);

      return res.json({
        success: true,
        data: relatorio,
        total: relatorio.length,
        periodo: { inicio, fim },
      });
    } catch (error) {
      console.error('Erro ao gerar relatorio por periodo:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message,
      });
    }
  }

  static async getByOrigin(req, res) {
    try {
      const { dias = 30 } = req.query;

      const sql = `
        SELECT origem, COUNT(*) as quantidade
        FROM devolucao
        WHERE data >= DATE_SUB(NOW(), INTERVAL ? DAY)
        GROUP BY origem
        ORDER BY quantidade DESC
      `;

      const result = await DualDatabase.executeOnMainPool(sql, [dias]);

      return res.json({ success: true, data: result });
    } catch (error) {
      console.error('Erro ao buscar devolucoes por origem:', error);
      return res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        details: error.message,
      });
    }
  }
}

module.exports = DevolucaoController;
