var router = require('express').Router();
var ratesController = require('../../../controllers/sougo/rates.controller');
var ipDataRatesController = require('../../../controllers/sougo/ipdata_rates.controller');

router.get('/sougo/getIPDataRate',  ipDataRatesController.listRates);
router.post('/sougo/ipDataRate/addIPDataRate', ipDataRatesController.addRates);
router.post('/sougo/ipDataRate/updateIPDataRate', ipDataRatesController.updateRates);

router.get('/sougo/rates',  ratesController.listRates);
router.post('/sougo/rates/add_rate', ratesController.addRates);
router.post('/sougo/rates/update_rate', ratesController.updateRates);

module.exports = router;