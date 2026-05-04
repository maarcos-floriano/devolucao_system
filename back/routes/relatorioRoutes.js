const express = require('express');
const RelatorioController = require('../controllers/RelatorioController');

const router = express.Router();

router.get('/excel/:tabela', RelatorioController.relatorioExcel);
router.get('/maquinas/flex', RelatorioController.relatorioMaquinasFlexivel);
router.get('/maquinas/flex/excel', RelatorioController.relatorioMaquinasFlexivelExcel);

router.get('/paulinho/maquinas', RelatorioController.relatorioPaulinhoMaquinas);
router.get('/paulinho/monitores', RelatorioController.relatorioPaulinhoMonitores);
router.get('/paulinho/kit', RelatorioController.relatorioPaulinhoKit);

router.get('/sac/semanal', RelatorioController.relatorioSACSemanal);
router.get('/sac/diario', RelatorioController.relatorioSACSemanal);

module.exports = router;
