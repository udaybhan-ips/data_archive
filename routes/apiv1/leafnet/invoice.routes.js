var router = require('express').Router();
var InvoiceController = require('../../../controllers/leafnet/invoice.controller');

router.get('/leafnet/invoice_data',  InvoiceController.getInvoiceData);

module.exports = router;