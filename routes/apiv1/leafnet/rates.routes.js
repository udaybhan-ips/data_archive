var router = require('express').Router();
var ratesController = require('../../../controllers/leafnet/rates.controller');

router.get('/leafnet/rates',  ratesController.listRates);
router.post('/leafnet/rates/add_rate', ratesController.addRates);
router.post('/leafnet/rates/update_rate', ratesController.updateRates);

module.exports = router;