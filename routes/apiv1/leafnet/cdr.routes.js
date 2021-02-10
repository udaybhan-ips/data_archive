var router = require('express').Router();
var CDRController = require('../../../controllers/leafnet/cdr.controller');

router.get('/leafnet/cdr',  CDRController.getCDRPath);

module.exports = router;