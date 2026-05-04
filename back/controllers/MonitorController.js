const Monitor = require('../models/Monitor');

class MonitorController {
  static async create(req, res) {
    try {
      const monitorData = req.body;

      if (!monitorData.marca || !monitorData.tamanho || !monitorData.origem || !monitorData.responsavel) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatorios: marca, tamanho, origem e responsavel',
        });
      }

      const monitor = await Monitor.create(monitorData);
      return res.status(201).json({
        success: true,
        message: 'Monitor criado com sucesso',
        data: monitor,
      });
    } catch (error) {
      console.error('Erro ao criar monitor:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;

      const [dados, total] = await Promise.all([
        Monitor.findAll({ page, limit, search: search.toString() }),
        Monitor.count(search.toString()),
      ]);

      return res.json({
        success: true,
        dados,
        total,
        totalPaginas: Math.ceil(total / Number(limit || 10)),
        paginaAtual: Number(page || 1),
        limite: Number(limit || 10),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findToday(req, res) {
    try {
      const monitores = await Monitor.findToday();
      return res.json({ success: true, data: monitores, total: monitores.length });
    } catch (error) {
      console.error('Erro ao listar monitores do dia:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const monitor = await Monitor.findById(req.params.id);

      if (!monitor) {
        return res.status(404).json({ success: false, error: 'Monitor nao encontrado' });
      }

      return res.json({ success: true, data: monitor.toJSON() });
    } catch (error) {
      console.error('Erro ao buscar monitor:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const updatedMonitor = await Monitor.update(req.params.id, req.body);

      if (!updatedMonitor) {
        return res.status(404).json({ success: false, error: 'Monitor nao encontrado' });
      }

      return res.json({
        success: true,
        message: 'Monitor atualizado com sucesso',
        data: updatedMonitor.toJSON(),
      });
    } catch (error) {
      console.error('Erro ao atualizar monitor:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const deleted = await Monitor.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, error: 'Monitor nao encontrado' });
      }

      return res.json({ success: true, message: 'Monitor deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar monitor:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = MonitorController;
