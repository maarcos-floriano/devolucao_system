const Maquina = require('../models/Maquina');

class MaquinaController {
  static async create(req, res) {
    try {
      const maquinaData = req.body;

      if (!maquinaData.sku || !maquinaData.codigo || !maquinaData.responsavel) {
        return res.status(400).json({ error: 'Campos obrigatórios: sku, codigo e responsavel' });
      }

      const maquina = await Maquina.create(maquinaData);
      return res.status(201).json({ success: true, message: 'Máquina criada com sucesso', data: maquina });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const [dados, total] = await Promise.all([
        Maquina.findAll({ page: parseInt(page), limit: parseInt(limit), search: search.toString() }),
        Maquina.count(search.toString()),
      ]);

      return res.json({ success: true, dados, total, totalPaginas: Math.ceil(total / parseInt(limit)), paginaAtual: parseInt(page), limite: parseInt(limit) });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findToday(req, res) {
    try {
      const maquinas = await Maquina.findToday();
      return res.json({ success: true, data: maquinas });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const maquina = await Maquina.findById(req.params.id);
      if (!maquina) return res.status(404).json({ success: false, error: 'Máquina não encontrada' });
      return res.json({ success: true, data: maquina.toJSON() });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const maquina = await Maquina.update(req.params.id, req.body);
      return res.json({ success: true, message: 'Máquina atualizada com sucesso', data: maquina.toJSON() });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await Maquina.delete(req.params.id);
      return res.json({ success: true, message: 'Máquina excluída com sucesso' });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = MaquinaController;
