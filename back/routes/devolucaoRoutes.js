// routes/Routes.js
const express = require('express');
const router = express.Router();
const DevolucaoController = require('../controllers/DevolucaoController');

// Rotas CRUD básicas
router.post('/', DevolucaoController.create);
router.get('/', DevolucaoController.findAll);
router.get('/:id', DevolucaoController.findById);
router.put('/:id', DevolucaoController.update);
router.delete('/:id', DevolucaoController.delete);
// Rotas específicas
router.get('/hoje', DevolucaoController.findToday);
router.get('/stats', DevolucaoController.getStats);
router.get('/relatorio/diario', DevolucaoController.exportDailyReport);
router.get('/relatorio/periodo', DevolucaoController.getReportByPeriod);
router.get('/origem', DevolucaoController.getByOrigin);

// Rotas para compatibilidade com o frontend existente
router.get('/api/', DevolucaoController.findAll);
router.post('/api/', DevolucaoController.create);
router.get('/api/:id', DevolucaoController.findById);
router.put('/api/:id', DevolucaoController.update);
router.delete('/api/:id', DevolucaoController.delete);

// Rotas para relatórios (compatíveis com o dashboard HTML)
router.get('/api/relatorio-excel/', DevolucaoController.exportDailyReport);

module.exports = router;