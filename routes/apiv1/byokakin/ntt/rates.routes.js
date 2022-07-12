var router = require('express').Router();
var ratesController = require('../../../../controllers/byokakin/ntt/rates.controller');

router.get('/byokakin/ntt/rates',  ratesController.listRates);
router.post('/byokakin/ntt/rates/add_rate', ratesController.addRates);
router.post('/byokakin/ntt/rates/update_rate', ratesController.updateRates);

module.exports = router;