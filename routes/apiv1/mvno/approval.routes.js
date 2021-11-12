var router = require('express').Router();
var approvalController = require('../../../controllers/mvno/approval.controller');

router.post('/mvno/approval/get',  approvalController.getStatusByInvoiceNo);
router.post('/mvno/approval/add_status', approvalController.addApprovalStatus);


module.exports = router;