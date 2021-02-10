var router = require('express').Router();
var ratesController = require('../../../controllers/leafnet/rates.controller');

router.get('/leafnet/rates',  ratesController.listRates);
router.post('/leafnet/rates/add_rates', ratesController.addRates);
router.post('/leaftnet/rates/update_rates', ratesController.addRates);

module.exports = router;