var router = require('express').Router();
var ratesController = require('../../../../controllers/byokakin/kddi/rates.controller');

router.get('/byokakin/kddi/rates',  ratesController.listRates);
// router.post('/kickback/rates/add_rate', ratesController.addRates);
// router.post('/kickback/rates/update_rate', ratesController.updateRates);

module.exports = router;