const express = require('express');
const router = express.Router();
const MaquinaController = require('../controllers/MaquinaController');

// Middleware de validação (simples)
const validateMaquina = (req, res, next) => {
  const { sku, codigo, responsavel } = req.body;
  
  if (!sku || !codigo || !responsavel) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatórios: sku, codigo e responsavel'
    });
  }
  
  next();
};

// Rotas CRUD
router.post('/', validateMaquina, MaquinaController.create);
router.get('/', MaquinaController.findAll);
router.get('/dia', MaquinaController.findToday);
router.get('/:id', MaquinaController.findById);
router.put('/:id', validateMaquina, MaquinaController.update);
router.delete('/:id', MaquinaController.delete);

module.exports = router;