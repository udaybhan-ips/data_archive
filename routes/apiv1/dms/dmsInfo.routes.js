var router = require('express').Router();
var DMSServiceInfoController = require('../../../controllers/dms/dms.controller');

router.post('/dms/create_billing_data',  DMSServiceInfoController.createDMSBillingData);
router.post('/dms/get_summary_data',  DMSServiceInfoController.getDMSSummaryData);
router.post('/dms/get_detail_data',  DMSServiceInfoController.getDMSDetailsData);
router.post('/dms/delete_summary_data',  DMSServiceInfoController.deleteDMSDetailsData);
router.get('/dms/rates',  DMSServiceInfoController.getDMSRateDetails);
router.post('/dms/update_rate',  DMSServiceInfoController.updateDMSRate);


// router.post('/addi_service/createAddiServiceDetails',  DMSServiceInfoController.createAddiServiceDetails);
// router.post('/addi_service/getAddiServiceDetails',  DMSServiceInfoController.getAddiServiceDetails);
// router.post('/addi_service/getAddiServiceSummaryData',  DMSServiceInfoController.getAddiServiceSummaryData);
// router.post('/addi_service/getAddiServiceDetailsData',  DMSServiceInfoController.getAddiServiceDetailsData);
// router.post('/addi_service/deleteAddiServiceInfo',  DMSServiceInfoController.deleteAddiServiceInfo);
// router.post('/addi_service/addAddiServiceInfo',  DMSServiceInfoController.addAddiServiceInfo);
// router.post('/addi_service/updateAddiServiceConfig',  DMSServiceInfoController.updateAddiServiceInfo);

module.exports = router;