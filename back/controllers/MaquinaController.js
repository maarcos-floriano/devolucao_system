const Maquina = require('../models/Maquina');
const MaquinaConfiguracao = require('../models/MaquinaConfiguracao');

class MaquinaController {
  static async create(req, res) {
    try {
      const maquinaData = req.body;

      if (!maquinaData.codigo || !maquinaData.config) {
        return res.status(400).json({
          error: 'Campos obrigatórios: codigo e config',
        });
      }

      const maquina = await Maquina.create(maquinaData);
      res.status(201).json({
        success: true,
        message: 'Máquina criada com sucesso',
        data: maquina,
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;

      const [dados, total] = await Promise.all([
        Maquina.findAll({
          page: parseInt(page),
          limit: parseInt(limit),
          search: search.toString(),
        }),
        Maquina.count(search.toString()),
      ]);

      return res.json({
        success: true,
        dados,
        total,
        totalPaginas: Math.ceil(total / parseInt(limit)),
        paginaAtual: parseInt(page),
        limite: parseInt(limit),
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findToday(req, res) {
    return this.findAll(req, res);
  }

  static async findById(req, res) {
    try {
      const { id } = req.params;
      const maquina = await Maquina.findById(id);

      if (!maquina) {
        return res.status(404).json({ success: false, error: 'Máquina não encontrada' });
      }

      res.json({ success: true, data: maquina.toJSON() });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const maquina = await Maquina.update(id, req.body);
      res.json({ success: true, message: 'Máquina atualizada com sucesso', data: maquina.toJSON() });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await Maquina.delete(req.params.id);
      res.json({ success: true, message: 'Máquina excluída com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async listConfigs(req, res) {
    try {
      const { search = '' } = req.query;
      const data = await MaquinaConfiguracao.findAll(search.toString());
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createConfig(req, res) {
    try {
      const { codigo, config } = req.body;
      if (!codigo || !config) {
        return res.status(400).json({ success: false, error: 'Campos obrigatórios: codigo e config' });
      }

      const data = await MaquinaConfiguracao.create({ codigo, config });
      res.status(201).json({ success: true, message: 'Configuração criada com sucesso', data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = MaquinaController;
