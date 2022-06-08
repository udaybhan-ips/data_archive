var router = require('express').Router();
var NTTSummaryController = require('../../../../controllers/byokakin/ntt/summary.controller');

router.post('/byokakin/ntt/cdr/getSummaryDataByMonth',  NTTSummaryController.getSummary);

module.exports = router;