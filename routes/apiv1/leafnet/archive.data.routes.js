var router = require('express').Router();
var archiveController = require('./../../../controllers/leafnet/archive.controller');

router.get('/leafnet/archive',  archiveController.getArchiveStatus);
router.post('/leafnet/update_archive_date',  archiveController.updateArchiveDate);
router.get('/leafnet/reprocess',  archiveController.getData);


module.exports = router;