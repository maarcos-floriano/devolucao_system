const express = require('express');
const router = express.Router();
const RelatorioController = require('../controllers/RelatorioController');

// Relatórios Excel simples
router.get('/excel/:tabela', RelatorioController.relatorioExcel);

// Relatórios Paulinho/Nick
router.get('/paulinho/maquinas', RelatorioController.relatorioPaulinhoMaquinas);
router.get('/paulinho/monitores', RelatorioController.relatorioPaulinhoMonitores);
router.get('/paulinho/kit', RelatorioController.relatorioPaulinhoKit);

// Relatórios SAC
router.get('/sac/semanal', RelatorioController.relatorioSACSemanal);
router.get('/sac/diario', RelatorioController.relatorioSACDiario);

module.exports = router;