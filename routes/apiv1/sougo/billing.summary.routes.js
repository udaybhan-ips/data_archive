var router = require('express').Router();
var SummaryController = require('../../../controllers/kickback/summary.controller');

router.get('/kickback/summary',  SummaryController.getSummary);

module.exports = router;