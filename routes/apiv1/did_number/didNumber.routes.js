var router = require('express').Router();
var DIDNumberListController = require('../../../controllers/did_number/numberList.controller');

router.post('/did_number/getDIDNumber',  DIDNumberListController.getDIDNumberList);
router.post('/did_number/updateDIDNumber',  DIDNumberListController.updateDIDNumberList);
router.post('/did_number/addDIDNumber',  DIDNumberListController.addDIDNumberList);

module.exports = router;