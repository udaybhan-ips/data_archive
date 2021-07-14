var router = require('express').Router();
var CDRController = require('../../../controllers/kickback/cdr.controller');

router.get('/kickback/cdr',  CDRController.getCDRPath);

module.exports = router;