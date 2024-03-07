var router = require('express').Router();
var InvoiceController = require('../../../controllers/kickback/invoice.controller');

router.post('/kickback/invoice_data',  InvoiceController.getInvoice);


module.exports = router;