var router = require('express').Router();
var InvoiceController = require('../../../controllers/sougo/invoice.controller');

router.get('/sougo/invoice_data',  InvoiceController.getInvoice);


module.exports = router;