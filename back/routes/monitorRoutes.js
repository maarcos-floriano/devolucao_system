const express = require('express');
const MonitorController = require('../controllers/MonitorController');

const router = express.Router();

const validateMonitor = (req, res, next) => {
  const { marca, tamanho, origem, responsavel } = req.body;

  if (!marca || !tamanho || !origem || !responsavel) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatorios: marca, tamanho, origem e responsavel',
    });
  }

  next();
};

router.post('/', validateMonitor, MonitorController.create);
router.get('/', MonitorController.findAll);
router.get('/dia', MonitorController.findToday);
router.get('/:id', MonitorController.findById);
router.put('/:id', validateMonitor, MonitorController.update);
router.delete('/:id', MonitorController.delete);

module.exports = router;
