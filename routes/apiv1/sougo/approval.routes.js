var router = require('express').Router();
var approvalController = require('../../../controllers/sougo/approval.controller');

router.post('/sougo/approval/get',  approvalController.getStatusByInvoiceNo);
router.post('/sougo/approval/add_status', approvalController.addApprovalStatus);


module.exports = router;