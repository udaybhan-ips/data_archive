var router = require('express').Router();
var CDRController = require('../../../controllers/sonus_outbound/cdr.controller');

router.get('/sonus_outbound/cdr',  CDRController.getCDRPath);

module.exports = router;