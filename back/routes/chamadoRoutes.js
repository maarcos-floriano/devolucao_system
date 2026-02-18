const express = require('express');
const ChamadoController = require('../controllers/ChamadoController');

const router = express.Router();

router.get('/', ChamadoController.findAll);
router.get('/abertos/contador', ChamadoController.getOpenCount);
router.post('/', ChamadoController.create);
router.put('/:id', ChamadoController.update);

module.exports = router;
