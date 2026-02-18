const Chamado = require('../models/Chamado');
const Devolucao = require('../models/Devolucao');

class ChamadoController {
  static async create(req, res) {
    try {
      const { devolucao_id, problema, status, acao_tomada } = req.body;

      if (!devolucao_id || !problema) {
        return res.status(400).json({
          success: false,
          error: 'devolucao_id e problema são obrigatórios',
        });
      }

      const devolucao = await Devolucao.findById(parseInt(devolucao_id, 10));
      if (!devolucao) {
        return res.status(404).json({ success: false, error: 'Devolução não encontrada' });
      }

      const chamado = await Chamado.create({
        devolucao_id: parseInt(devolucao_id, 10),
        problema,
        status,
        acao_tomada,
      });

      return res.status(201).json({ success: true, data: chamado });
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '', status } = req.query;

      const [dados, total, totalAbertos] = await Promise.all([
        Chamado.findAll({
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          search: search.toString(),
          status: status?.toString(),
        }),
        Chamado.count(search.toString(), status?.toString()),
        Chamado.countOpen(),
      ]);

      return res.json({
        success: true,
        dados,
        total,
        totalAbertos,
        totalPaginas: Math.ceil(total / parseInt(limit, 10)),
      });
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const chamado = await Chamado.update(parseInt(id, 10), req.body);
      return res.json({ success: true, data: chamado, message: 'Chamado atualizado com sucesso' });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      return res.status(statusCode).json({ success: false, error: error.message });
    }
  }

  static async getOpenCount(req, res) {
    try {
      const total = await Chamado.countOpen();
      return res.json({ success: true, total });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ChamadoController;
