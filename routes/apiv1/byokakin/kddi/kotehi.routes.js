var router = require('express').Router();
var KDDIKotehiController = require('../../../../controllers/byokakin/kddi/archive.controller');

router.post('/byokakin/kddi/kotehi',  KDDIKotehiController.getKDDIKotehiData);
router.post('/byokakin/kddi/kotehiLastMonth',  KDDIKotehiController.getLastMonthKDDIKotehiData);
router.post('/byokakin/kddi/kotehiPrevMonthData',  KDDIKotehiController.getKDDIKotehiLastMonthData);


module.exports = router;