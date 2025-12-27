// src/routes/Routes.js (Arquivo de rotas correspondente)
const express = require('express');
const router = express.Router();
const KitController = require('../controllers/KitController');

// Rotas CRUD básicas
router.post('/', KitController.create);
router.get('/', KitController.findAll);
router.get('/:id', KitController.findById);
router.put('/:id', KitController.update);
router.delete('/:id', KitController.delete);
// Rotas específicas
router.get('/hoje', KitController.findToday);
router.get('/relatorio/excel', KitController.exportExcelToday);
router.get('/relatorio/paulinho', KitController.relatorioPaulinho);
router.get('/stats', KitController.getStats);

// Para compatibilidade com as rotas existentes
router.get('/api/', KitController.findAll);
router.post('/api/', KitController.create);
router.get('/api/:id', KitController.findById);
router.put('/api/:id', KitController.update);
router.delete('/api/:id', KitController.delete);
router.get('/api/relatorio-excel/', KitController.exportExcelToday);
router.get('/api/relatorio-paulinho-kit', KitController.relatorioPaulinho);

module.exports = router;