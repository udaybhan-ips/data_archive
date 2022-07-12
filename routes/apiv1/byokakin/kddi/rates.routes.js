var router = require('express').Router();
var ratesController = require('../../../../controllers/byokakin/kddi/rates.controller');

router.get('/byokakin/kddi/rates',  ratesController.listRates);
router.post('/byokakin/kddi/rates/add_rate', ratesController.addRates);
router.post('/byokakin/kddi/rates/update_rate', ratesController.updateRates);

module.exports = router;