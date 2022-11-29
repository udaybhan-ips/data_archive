var router = require('express').Router();
var SougoBillInfoController = require('../../../controllers/sougo/billInfo.controller');

router.get('/sougo/billInfo',  SougoBillInfoController.getAllBillInfo);
//router.post('/sougo/carrier/add_carrier', SougoBillInfoController.addCarrier);
router.post('/sougo/billInfo/update_billInfo', SougoBillInfoController.updateBillInfo);

module.exports = router;