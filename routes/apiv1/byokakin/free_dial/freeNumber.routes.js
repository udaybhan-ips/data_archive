var router = require('express').Router();
var FreeNumListController = require('../../../../controllers/byokakin/free_dial/numberList.controller');

router.post('/byokakin/free_dial/getFreeDialNumber',  FreeNumListController.getFreeDialNumberList);
router.post('/byokakin/free_dial/updateFreeDialNumber',  FreeNumListController.updateFreeDialNumberList);
router.post('/byokakin/free_dial/addFreeDialNumber',  FreeNumListController.addFreeDialNumberList);

module.exports = router;