var router = require('express').Router();
var approvalController = require('../../../controllers/leafnet/approval.controller');

router.post('/leafnet/approval/get',  approvalController.getStatusByInvoiceNo);
router.post('/leafnet/approval/add_status', approvalController.addApprovalStatus);


module.exports = router;