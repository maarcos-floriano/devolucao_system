const express = require('express');
const MaquinaController = require('../controllers/MaquinaController');

const router = express.Router();

const validateMaquina = (req, res, next) => {
  const { codigo, config, defeito } = req.body;

  if (!codigo || !config || !defeito) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatorios: codigo, config e defeito',
    });
  }

  next();
};

router.get('/configuracoes', MaquinaController.listConfigs);
router.post('/configuracoes', MaquinaController.createConfig);
router.put('/configuracoes/:id', MaquinaController.updateConfig);
router.delete('/configuracoes/:id', MaquinaController.deleteConfig);

router.post('/', validateMaquina, MaquinaController.create);
router.get('/', MaquinaController.findAll);
router.get('/dia', MaquinaController.findToday);
router.get('/:id', MaquinaController.findById);
router.put('/:id', validateMaquina, MaquinaController.update);
router.delete('/:id', MaquinaController.delete);

module.exports = router;
