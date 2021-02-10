var router = require('express').Router();
var SonusOutboundRateController = require('../../../controllers/sonus_outbound/rates.controller');

router.get('/sonus_outbound/rates',  SonusOutboundRateController.listRates);
router.post('/sonus_outbound/rates/add_rates', SonusOutboundRateController.addRates);
router.post('/sonus_outbound/rates/update_rates', SonusOutboundRateController.updateRates);

module.exports = router;