var router = require('express').Router();
var AccountInfoController = require('../../../../controllers/byokakin/account_info/accountInfo.controller');

router.post('/byokakin/account/getAccountNumber',  AccountInfoController.getAccountInfo);
router.post('/byokakin/account/updateAccountNumber',  AccountInfoController.updateAccountInfo);
router.post('/byokakin/account/addAccountNumber',  AccountInfoController.addAccountInfo);

module.exports = router;