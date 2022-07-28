var router = require('express').Router();
var ByokakinCustomerListController = require('../../../../controllers/byokakin/customer/manageCustomer.controller');

router.post('/byokakin/customer/list',  ByokakinCustomerListController.getByokiakinCustomerList);
router.post('/byokakin/customer/update',  ByokakinCustomerListController.updateByokakinCustomer);
router.post('/byokakin/byokakin_customer/addFreeDialNumber',  ByokakinCustomerListController.addFreeDialNumberList);

module.exports = router;