var router = require('express').Router();
var ratesController = require('../../../controllers/sougo/rates.controller');

router.get('/sougo/rates',  ratesController.listRates);
router.post('/sougo/rates/add_rate', ratesController.addRates);
router.post('/sougo/rates/update_rate', ratesController.updateRates);

module.exports = router;