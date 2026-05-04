const express = require('express');
const DevolucaoController = require('../controllers/DevolucaoController');
const uploadDevolucaoImagem = require('../middleware/devolucaoUpload');

const router = express.Router();

router.post('/', uploadDevolucaoImagem.single('imagem'), DevolucaoController.create);
router.get('/', DevolucaoController.findAll);

router.post('/etiqueta/analisar', uploadDevolucaoImagem.single('imagem'), DevolucaoController.analyzeLabel);
router.get('/hoje', DevolucaoController.findToday);
router.get('/stats', DevolucaoController.getStats);
router.get('/relatorio/diario', DevolucaoController.exportDailyReport);
router.get('/relatorio/periodo', DevolucaoController.getReportByPeriod);
router.get('/origem', DevolucaoController.getByOrigin);
router.get('/api/relatorio-excel/', DevolucaoController.exportDailyReport);

router.get('/:id', DevolucaoController.findById);
router.put('/:id', uploadDevolucaoImagem.single('imagem'), DevolucaoController.update);
router.delete('/:id', DevolucaoController.delete);

module.exports = router;
