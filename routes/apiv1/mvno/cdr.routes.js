var router = require('express').Router();
var CDRController = require('../../../controllers/kickback/cdr.controller');

router.get('/kickback/cdr',  CDRController.getCDRPath);
router.get('/kickback/customer_list',  CDRController.getKickbackCustomerList);

module.exports = router;