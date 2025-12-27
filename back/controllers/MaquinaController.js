const Maquina = require('../models/Maquina');

class MaquinaController {
  // Criar nova máquina
  static async create(req, res) {
    try {
      const maquinaData = req.body;

      // Validação básica
      if (!maquinaData.processador || !maquinaData.memoria || !maquinaData.origem || !maquinaData.responsal) {
        return res.status(400).json({
          error: 'Campos obrigatórios: processador, memoria, origem e responsal'
        });
      }

      const maquina = await Maquina.create(maquinaData);
      res.status(201).json({
        success: true,
        message: 'Máquina criada com sucesso',
        data: maquina.toJSON()
      });
    } catch (error) {
      console.error('Erro ao criar máquina:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Listar todas as máquinas
  static async findAll(req, res) {
    try {
      let { page = 1, limit = 10, search = '' } = req.query;

      // 🔒 blindagem
      if (typeof search !== 'string') {
        search = '';
      }

      page = Number(page);
      limit = Number(limit);

      const result = await Maquina.findAll({ page, limit, search });

      res.json({
        success: true,
        data: result,
        pagination: {
          page,
          limit
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  }


  // Listar máquinas do dia
  static async findToday(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const maquinas = await Maquina.findToday({ page, limit, search });

      if (!maquinas || maquinas.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Nenhuma máquina encontrada para o dia de hoje'
        });
      }

      res.json({
        success: true,
        data: maquinas.map(m => m.toJSON())
      });
    } catch (error) {
      console.error('Erro ao listar máquinas do dia:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Buscar máquina por ID
  static async findById(req, res) {
    try {
      const { id } = req.params;
      const maquina = await Maquina.findById(id);

      if (!maquina) {
        return res.status(404).json({
          success: false,
          error: 'Máquina não encontrada'
        });
      }

      res.json({
        success: true,
        data: maquina.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar máquina:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Atualizar máquina
  static async update(req, res) {
    try {
      const { id } = req.params;
      const maquinaData = req.body;

      const maquina = await Maquina.update(id, maquinaData);

      res.json({
        success: true,
        message: 'Máquina atualizada com sucesso',
        data: maquina.toJSON()
      });
    } catch (error) {
      console.error('Erro ao atualizar máquina:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Excluir máquina
  static async delete(req, res) {
    try {
      const { id } = req.params;

      await Maquina.delete(id);

      res.json({
        success: true,
        message: 'Máquina excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir máquina:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // Método para buscar devoluções relacionadas (para o select)
  static async getDevolucoesForSelect(req, res) {
    try {
      const { search = '' } = req.query;
      const termo = `%${search}%`;

      // Esta query busca devoluções para popular o select
      const sql = `
        SELECT id, cliente, origem 
        FROM devolucao 
        WHERE origem LIKE ? OR cliente LIKE ? 
        ORDER BY id DESC 
        LIMIT 100
      `;

      const rows = await DualDatabase.executeOnMainPool(sql, [termo, termo]);

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Erro ao buscar devoluções:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = MaquinaController;