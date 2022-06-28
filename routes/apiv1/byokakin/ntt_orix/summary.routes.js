var router = require('express').Router();
var NTTORIXSummaryController = require('../../../../controllers/byokakin/ntt_orix/summary.controller');

router.post('/byokakin/ntt_orix/cdr/getSummaryDataByMonth',  NTTORIXSummaryController.getSummary);

module.exports = router;