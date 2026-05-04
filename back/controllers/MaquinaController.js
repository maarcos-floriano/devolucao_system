const Maquina = require('../models/Maquina');
const MaquinaConfiguracao = require('../models/MaquinaConfiguracao');

const getRole = (req) => String(req.headers['x-user-role'] || '').toLowerCase();
const isAdmin = (req) => getRole(req) === 'admin';

async function validateFixedConfig(req, maquinaData) {
  if (isAdmin(req)) {
    return;
  }

  const config = await MaquinaConfiguracao.findByCodigo(maquinaData.codigo);
  if (!config || config.config !== maquinaData.config) {
    const error = new Error('Selecione uma configuracao fixa cadastrada pelo ADM');
    error.status = 403;
    throw error;
  }
}

class MaquinaController {
  static async create(req, res) {
    try {
      const maquinaData = req.body;

      if (!maquinaData.codigo || !maquinaData.config || !maquinaData.defeito) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatorios: codigo, config e defeito',
        });
      }

      await validateFixedConfig(req, maquinaData);

      const maquina = await Maquina.create(maquinaData);
      res.status(201).json({
        success: true,
        message: 'Maquina criada com sucesso',
        data: maquina,
      });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, error: error.message });
    }
  }

  static async findAll(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;

      const [dados, total] = await Promise.all([
        Maquina.findAll({ page, limit, search: search.toString() }),
        Maquina.count(search.toString()),
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
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findToday(req, res) {
    try {
      const data = await Maquina.findToday();
      return res.json({ success: true, data, total: data.length });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async findById(req, res) {
    try {
      const maquina = await Maquina.findById(req.params.id);

      if (!maquina) {
        return res.status(404).json({ success: false, error: 'Maquina nao encontrada' });
      }

      res.json({ success: true, data: maquina.toJSON() });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const atual = await Maquina.findById(req.params.id);
      if (!atual) {
        return res.status(404).json({ success: false, error: 'Maquina nao encontrada' });
      }

      const merged = {
        codigo: req.body.codigo ?? atual.codigo,
        config: req.body.config ?? atual.config,
        defeito: req.body.defeito ?? atual.defeito,
      };

      if (!merged.codigo || !merged.config || !merged.defeito) {
        return res.status(400).json({
          success: false,
          error: 'Campos obrigatorios: codigo, config e defeito',
        });
      }

      await validateFixedConfig(req, merged);

      const maquina = await Maquina.update(req.params.id, merged);
      res.json({ success: true, message: 'Maquina atualizada com sucesso', data: maquina.toJSON() });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      await Maquina.delete(req.params.id);
      res.json({ success: true, message: 'Maquina excluida com sucesso' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async listConfigs(req, res) {
    try {
      const data = await MaquinaConfiguracao.findAll(String(req.query.search || ''));
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createConfig(req, res) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Apenas ADM pode criar configuracoes' });
      }

      const { codigo, config } = req.body;
      if (!codigo || !config) {
        return res.status(400).json({ success: false, error: 'Campos obrigatorios: codigo e config' });
      }

      const data = await MaquinaConfiguracao.create({ codigo, config });
      res.status(201).json({ success: true, message: 'Configuracao criada com sucesso', data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateConfig(req, res) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Apenas ADM pode alterar configuracoes' });
      }

      const { codigo, config } = req.body;
      if (!codigo || !config) {
        return res.status(400).json({ success: false, error: 'Campos obrigatorios: codigo e config' });
      }

      const data = await MaquinaConfiguracao.update(req.params.id, { codigo, config });
      res.json({ success: true, message: 'Configuracao atualizada com sucesso', data });
    } catch (error) {
      res.status(error.message.includes('nao encontrada') ? 404 : 500).json({ success: false, error: error.message });
    }
  }

  static async deleteConfig(req, res) {
    try {
      if (!isAdmin(req)) {
        return res.status(403).json({ success: false, error: 'Apenas ADM pode excluir configuracoes' });
      }

      await MaquinaConfiguracao.delete(req.params.id);
      res.json({ success: true, message: 'Configuracao excluida com sucesso' });
    } catch (error) {
      res.status(error.message.includes('nao encontrada') ? 404 : 500).json({ success: false, error: error.message });
    }
  }
}

module.exports = MaquinaController;
