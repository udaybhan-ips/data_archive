var router = require('express').Router();
var ratesController = require('../../../../controllers/byokakin/kddi/rates.controller');

router.post('/byokakin/kddi/rates',  ratesController.listRates);
router.post('/byokakin/kddi/rates/add_rate', ratesController.addRates);
router.post('/byokakin/kddi/rates/update_rate', ratesController.updateRates);
router.post('/byokakin/ntt_kddi/rates/history', ratesController.ratesHistory);

module.exports = router;