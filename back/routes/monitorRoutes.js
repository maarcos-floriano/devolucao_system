const express = require('express');
const router = express.Router();
const MonitorController = require('../controllers/MonitorController');

// Middleware de validação
const validateMonitor = (req, res, next) => {
  const { marca, tamanho, responsavel } = req.body;
  
  if (!marca || !tamanho || !responsavel) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatórios: marca, tamanho e responsavel'
    });
  }
  
  next();
};

// Rotas CRUD
router.post('/', validateMonitor, MonitorController.create);
router.get('/', MonitorController.findAll);
router.get('/dia', MonitorController.findToday);
router.get('/:id', MonitorController.findById);

module.exports = router;