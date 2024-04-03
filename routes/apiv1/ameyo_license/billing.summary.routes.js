var router = require('express').Router();
var SummaryController = require('../../../controllers/ameyo_license/summary.controller');

router.get('/ameyo_license/invoice_data',  SummaryController.getSummary);
router.post('/ameyo_license/getSummaryDataByMonth',  SummaryController.getSummaryByMonth);
router.post('/ameyo_license/getDetailDataByMonth',  SummaryController.getDetailsDataByMonth);

router.get('/ameyo_license/all_data',  SummaryController.getALLAmeyoData);

module.exports = router;