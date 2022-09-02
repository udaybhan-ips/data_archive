var router = require('express').Router();
var CommissionInfoController = require('../../../controllers/commission/commissionInfo.controller');

router.post('/commission/agentList',  CommissionInfoController.getCommissionInfo);
router.post('/commission/createCommissionDetails',  CommissionInfoController.createCommissionDetails);
router.post('/commission/getCommissionDetails',  CommissionInfoController.getCommissionDetails);
router.post('/commission/getCommissionSummary',  CommissionInfoController.getCommissionSummary);
// router.post('/byokakin/addi_kotehi/addAddiKotehiNumber',  CommissionInfoController.addAddiKotehiInfo);

module.exports = router;