var router = require('express').Router();
var archiveController = require('./../../../controllers/sonus_outbound/archive.controller');

router.get('/sonus_outbound/archive',  archiveController.getArchiveStatus);
router.get('/sonus_outbound/customer_list',  archiveController.getSonusCustomerList);
router.post('/sonus_outbound/update_archive_date',  archiveController.updateArchiveDate);
router.post('/sonus_outbound/reprocess',  archiveController.reprocessByCustomerId);


router.post('/sonus_outbound/kotehi',  archiveController.getKotehiData);
router.post('/sonus_outbound/kotehiLastMonth',  archiveController.getLastMonthKotehiData);
router.post('/sonus_outbound/addKotehiData',  archiveController.addKotehiData);
router.post('/sonus_outbound/deleteProcessedKotehiData',  archiveController.deleteKotehiProcessedData);

router.post('/sonus_outbound/processedData',  archiveController.getProcessedKotehiData);


module.exports = router;