const express = require('express');
const ChamadoController = require('../controllers/ChamadoController');

const router = express.Router();

router.get('/', ChamadoController.findAll);
router.get('/abertos/contador', ChamadoController.getOpenCount);
router.get('/matches', ChamadoController.findMatches);
router.post('/', ChamadoController.create);
router.put('/:id', ChamadoController.update);
router.delete('/:id', ChamadoController.delete);

module.exports = router;
