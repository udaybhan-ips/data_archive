var router = require('express').Router();
var SummaryController = require('../../../controllers/sonus_outbound/summary.controller');

router.get('/sonus_outbound/invoice_data',  SummaryController.getSummary);
router.post('/byokakin/sonusOutbound03/getSummaryDataByMonth',  SummaryController.getSummaryByMonth);
router.post('/byokakin/sonusOutbound03/getDetailDataByMonth',  SummaryController.getDetailsDataByMonth);

module.exports = router;