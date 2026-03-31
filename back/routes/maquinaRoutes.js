const express = require('express');
const router = express.Router();
const MaquinaController = require('../controllers/MaquinaController');

const validateMaquina = (req, res, next) => {
  const { codigo, config } = req.body;

  if (!codigo || !config) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatórios: codigo e config',
    });
  }

  next();
};

router.get('/configuracoes', MaquinaController.listConfigs);
router.post('/configuracoes', MaquinaController.createConfig);

router.post('/', validateMaquina, MaquinaController.create);
router.get('/', MaquinaController.findAll);
router.get('/dia', MaquinaController.findToday);
router.get('/:id', MaquinaController.findById);
router.put('/:id', validateMaquina, MaquinaController.update);
router.delete('/:id', MaquinaController.delete);

module.exports = router;
