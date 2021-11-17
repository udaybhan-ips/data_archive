var router = require('express').Router();
var archiveController = require('./../../../controllers/mvno/archive.controller');

router.get('/mvno/customer_list',  archiveController.getMVNOCustomerList);


module.exports = router;