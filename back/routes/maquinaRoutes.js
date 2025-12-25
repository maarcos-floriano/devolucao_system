const express = require('express');
const router = express.Router();
const MaquinaController = require('../controllers/MaquinaController');

// Middleware de validação (simples)
const validateMaquina = (req, res, next) => {
  const { processador, memoria, origem, responsavel } = req.body;
  
  if (!processador || !memoria || !origem || !responsavel) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatórios: processador, memoria, origem e responsavel'
    });
  }
  
  next();
};

// Rotas CRUD
router.post('/', validateMaquina, MaquinaController.create);
router.get('/', MaquinaController.findAll);
router.get('/dia', MaquinaController.findToday);
router.get('/devolucoes', MaquinaController.getDevolucoesForSelect);
router.get('/:id', MaquinaController.findById);
router.put('/:id', validateMaquina, MaquinaController.update);
router.delete('/:id', MaquinaController.delete);

module.exports = router;