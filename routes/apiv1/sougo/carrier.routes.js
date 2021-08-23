var router = require('express').Router();
var SougoCarrierController = require('../../../controllers/sougo/carrier.controller');

router.get('/sougo/carrier',  SougoCarrierController.listCarrier);
router.post('/sougo/carrier/add_carrier', SougoCarrierController.addCarrier);
router.post('/sougo/carrier/update_carrier', SougoCarrierController.updateCarrier);

module.exports = router;