var router = require('express').Router();
var KDDISummaryController = require('../../../../controllers/byokakin/kddi/summary.controller');

router.post('/byokakin/kddi/cdr/getSummaryDataByMonth',  KDDISummaryController.getSummary);

module.exports = router;