var router = require('express').Router();
var SummaryController = require('../../../controllers/mvno/summary.controller');

router.get('/mvno/invoice_data',  SummaryController.getSummary);


module.exports = router;