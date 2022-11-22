var router = require('express').Router();
var AddiServiceInfoController = require('../../../controllers/addi_service/addServiceInfo.controller');

router.post('/addi_service/agentList',  AddiServiceInfoController.getAddiServiceInfo);
router.post('/addi_service/createAddiServiceDetails',  AddiServiceInfoController.createAddiServiceDetails);
router.post('/addi_service/getAddiServiceDetails',  AddiServiceInfoController.getAddiServiceDetails);
router.post('/addi_service/getAddiServiceSummaryData',  AddiServiceInfoController.getAddiServiceSummaryData);
router.post('/addi_service/getAddiServiceDetailsData',  AddiServiceInfoController.getAddiServiceDetailsData);
router.post('/addi_service/deleteAddiServiceInfo',  AddiServiceInfoController.deleteAddiServiceInfo);
router.post('/addi_service/addAddiServiceInfo',  AddiServiceInfoController.addAddiServiceInfo);
router.post('/addi_service/updateAddiServiceConfig',  AddiServiceInfoController.updateAddiServiceInfo);

module.exports = router;