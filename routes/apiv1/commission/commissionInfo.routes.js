var router = require('express').Router();
var CommissionInfoController = require('../../../controllers/commission/commissionInfo.controller');

router.post('/commission/agentList',  CommissionInfoController.getCommissionInfo);
router.post('/commission/createCommissionDetails',  CommissionInfoController.createCommissionDetails);
router.post('/commission/getCommissionDetails',  CommissionInfoController.getCommissionDetails);
router.post('/commission/getCommissionSummary',  CommissionInfoController.getCommissionSummary);
router.post('/commission/deleteCommissionInfo',  CommissionInfoController.deleteCommissionInfo);
router.post('/commission/addCommissionInfo',  CommissionInfoController.addCommissionInfo);
router.post('/commission/updateCommissionConfig',  CommissionInfoController.updateCommissionInfo);
// commission config 
router.post('/commission/getCommissionConfigData',  CommissionInfoController.getCommissionConfig);
router.post('/commission/deleteCommissionConfigData',  CommissionInfoController.deleteCommissionConfig);
router.post('/commission/addCommissionConfigData',  CommissionInfoController.addCommissionConfig);
router.post('/commission/updateCommissionConfigData',  CommissionInfoController.updateCommissionConfig);
router.post('/commission/onApproveRowData',  CommissionInfoController.onApproveRowData);
router.post('/commission/getCommissionSchedule',  CommissionInfoController.getCommissionSchedule);
router.post('/commission/updateCommissionBatchDetails',  CommissionInfoController.updateCommissionBatchDetails);

router.post('/commission/getApprovalStatus',  CommissionInfoController.getApprovalStatus);
router.post('/commission/addApprovalStatus',  CommissionInfoController.addApprovalStatus);



module.exports = router;