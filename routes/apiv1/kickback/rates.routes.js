var router = require('express').Router();
var ratesController = require('../../../controllers/kickback/rates.controller');

router.get('/kickback/rates',  ratesController.listRates);
router.post('/kickback/rates/add_rate', ratesController.addRates);
router.post('/kickback/rates/update_rate', ratesController.updateRates);
router.get('/kickback/rates/getKickbackFreeDialRate', ratesController.getKickbackFreeDialRate);
router.post('/kickback/rates/updateKickbackFreeDialRate', ratesController.updateKickbackFreeDialRate);
router.post('/kickback/rates/addKickbackFreeDialRate', ratesController.addKickbackFreeDialRate);

module.exports = router;