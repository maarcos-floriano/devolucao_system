const Monitor = require('../models/Monitor');

class MonitorController {
  // Criar novo monitor
  static async create(req, res) {
    try {
      const monitorData = req.body;
      
      // Validação básica
      if (!monitorData.marca || !monitorData.tamanho || !monitorData.responsavel) {
        return res.status(400).json({ 
          error: 'Campos obrigatórios: marca, tamanho e responsavel' 
        });
      }

      const monitor = await Monitor.create(monitorData);
      res.status(201).json({
        success: true,
        message: 'Monitor criado com sucesso',
        data: monitor.toJSON()
      });
    } catch (error) {
      console.error('Erro ao criar monitor:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Listar todos os monitores
  static async findAll(req, res) {
    try {
      const monitores = await Monitor.findAll();
      
      res.json({
        success: true,
        data: monitores
      });
    } catch (error) {
      console.error('Erro ao listar monitores:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Listar monitores do dia
  static async findToday(req, res) {
    try {
      const monitores = await Monitor.findToday();
      
      res.json({
        success: true,
        data: monitores.map(m => m.toJSON())
      });
    } catch (error) {
      console.error('Erro ao listar monitores do dia:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }

  // Buscar monitor por ID
  static async findById(req, res) {
    try {
      const { id } = req.params;
      const monitor = await Monitor.findById(id);
      
      if (!monitor) {
        return res.status(404).json({ 
          success: false,
          error: 'Monitor não encontrado' 
        });
      }
      
      res.json({
        success: true,
        data: monitor.toJSON()
      });
    } catch (error) {
      console.error('Erro ao buscar monitor:', error);
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  }
}

module.exports = MonitorController;