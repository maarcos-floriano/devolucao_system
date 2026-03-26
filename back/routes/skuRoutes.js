const express = require('express');
const router = express.Router();
const SkuController = require('../controllers/SkuController');

router.get('/:tipo', SkuController.findAll);
router.post('/:tipo', SkuController.create);

module.exports = router;
