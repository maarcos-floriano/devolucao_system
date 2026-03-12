const Rma = require('../models/Rma');

class RmaController {
  static async create(req, res) {
    try {
      const {
        tipo_item,
        descricao_item,
        problema,
        destino,
        status,
        observacao,
        responsavel,
        fkDevolucao,
        data,
      } = req.body;

      if (!tipo_item || !problema) {
        return res.status(400).json({
          success: false,
          error: 'Tipo do item e problema são obrigatórios',
        });
      }

      const novoRma = await Rma.create({
        tipo_item,
        descricao_item,
        problema,
        destino,
        status,
        observacao,
        responsavel,
        fkDevolucao,
        data,
      });

      return res.status(201).json({
        success: true,
        message: 'Registro de RMA criado com sucesso',
        data: novoRma,
      });
    } catch (error) {
      console.error('Erro ao criar RMA:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 10;
      const search = req.query.search || '';

      const dados = await Rma.findAll({ page, limit, search });
      const total = await Rma.count(search);

      return res.json({ success: true, dados, total, page, limit });
    } catch (error) {
      console.error('Erro ao buscar RMAs:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      await Rma.delete(id);
      return res.json({ success: true, message: 'Registro de RMA excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir RMA:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async devolucoesSemVinculo(req, res) {
    try {
      const dados = await Rma.getDevolucoesSemVinculo();
      return res.json({ success: true, dados, total: dados.length });
    } catch (error) {
      console.error('Erro ao gerar relatório de devoluções sem vínculo:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = RmaController;
