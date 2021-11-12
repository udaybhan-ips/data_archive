var router = require('express').Router();
var archiveController = require('./../../../controllers/kickback/archive.controller');

router.get('/kickback/archive',  archiveController.getArchiveStatus);
router.post('/kickback/update_archive_date',  archiveController.updateArchiveDate);
router.get('/kickback/reprocess',  archiveController.getData);


module.exports = router;