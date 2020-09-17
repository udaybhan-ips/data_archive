var router = require('express').Router();
var archiveController = require('./../../../controllers/leafnet/archive.controller');

router.get('/archive/leafnet',  archiveController.getData);


module.exports = router;