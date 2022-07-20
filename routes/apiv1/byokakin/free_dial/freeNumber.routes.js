var router = require('express').Router();
var FreeNumListController = require('../../../../controllers/byokakin/free_dial/numberList.controller');

router.post('/byokakin/free_dial/getFreeDialNumber',  FreeNumListController.getFreeDialNumberList);

module.exports = router;