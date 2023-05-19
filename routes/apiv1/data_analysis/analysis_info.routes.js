var router = require('express').Router();

var AnalysisInfoController = require('../../../controllers/data_analysis/dataAnalysisInfo.controller');

router.post('/data_analysis/getData',  AnalysisInfoController.getAnalysisInfo);
// router.post('/commission/createCommissionDetails',  CommissionInfoController.createCommissionDetails);
// router.post('/commission/getCommissionDetails',  CommissionInfoController.getCommissionDetails);
// router.post('/commission/getCommissionSummary',  CommissionInfoController.getCommissionSummary);
// router.post('/commission/deleteCommissionInfo',  CommissionInfoController.deleteCommissionInfo);
// router.post('/commission/addCommissionInfo',  CommissionInfoController.addCommissionInfo);
// router.post('/commission/updateCommissionConfig',  CommissionInfoController.updateCommissionInfo);

module.exports = router;