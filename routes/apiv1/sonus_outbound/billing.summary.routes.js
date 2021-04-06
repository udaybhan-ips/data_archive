var router = require('express').Router();
var SummaryController = require('../../../controllers/sonus_outbound/summary.controller');

router.get('/sonus_outbound/invoice_data',  SummaryController.getSummary);

module.exports = router;