var router = require('express').Router();
var approvalController = require('../../../controllers/sonus_outbound/approval.controller');

router.post('/sonus_outbound/approval/get',  approvalController.getStatusByInvoiceNo);
router.post('/sonus_outbound/approval/add_status', approvalController.addApprovalStatus);


module.exports = router;