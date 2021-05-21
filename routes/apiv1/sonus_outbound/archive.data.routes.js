var router = require('express').Router();
var archiveController = require('./../../../controllers/sonus_outbound/archive.controller');

router.get('/sonus_outbound/archive',  archiveController.getArchiveStatus);
router.get('/sonus_outbound/customer_list',  archiveController.getSonusCustomerList);
router.post('/sonus_outbound/update_archive_date',  archiveController.updateArchiveDate);
router.post('/sonus_outbound/reprocess',  archiveController.reprocessByCustomerId);


module.exports = router;