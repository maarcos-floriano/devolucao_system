const express = require('express');
const RmaController = require('../controllers/RmaController');

const router = express.Router();

router.get('/relatorio/devolucoes-sem-vinculo', RmaController.devolucoesSemVinculo);
router.post('/', RmaController.create);
router.get('/', RmaController.findAll);
router.delete('/:id', RmaController.delete);

module.exports = router;
