var router = require('express').Router();
var ratesController = require('./../../controllers/leafnet/rates.controller');

router.get('/rates',  ratesController.listRates);
router.post('/rates', ratesController.addRates);

module.exports = router;