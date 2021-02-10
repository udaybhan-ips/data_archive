var router = require('express').Router();
var SummaryController = require('../../../controllers/leafnet/summary.controller');

router.get('/leafnet/summary',  SummaryController.getSummary);

module.exports = router;