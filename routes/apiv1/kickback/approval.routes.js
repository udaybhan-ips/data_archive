var router = require('express').Router();
var approvalController = require('../../../controllers/kickback/approval.controller');

router.post('/kickback/approval/get',  approvalController.getStatusByInvoiceNo);
router.post('/kickback/approval/add_status', approvalController.addApprovalStatus);


module.exports = router;