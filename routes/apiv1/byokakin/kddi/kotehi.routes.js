var router = require('express').Router();
var KDDIKotehiController = require('../../../../controllers/byokakin/kddi/archive.controller');

router.post('/byokakin/kddi/kotehi',  KDDIKotehiController.getKDDIKotehiData);
router.post('/byokakin/kddi/kotehiLastMonth',  KDDIKotehiController.getLastMonthKDDIKotehiData);
router.post('/byokakin/kddi/kotehiPrevMonthData',  KDDIKotehiController.getKDDIKotehiLastMonthData);
router.post('/byokakin/kddi/addKotehiData',  KDDIKotehiController.addKotehiData);
router.get('/byokakin/kddi/aServiceCodeData',  KDDIKotehiController.getKDDIKotehiAServiceDataData);
router.get('/byokakin/kddi/aBasicCodeData',  KDDIKotehiController.getKDDIKotehiABasciData);
router.get('/byokakin/kddi/freeAccountNumber',  KDDIKotehiController.getKDDIFreeAccountNumListDetails);
router.get('/byokakin/kddi/freeDailNumber',  KDDIKotehiController.getKDDIFreeDialNumListDetails);
router.get('/byokakin/kddi/aBasicServiceData',  KDDIKotehiController.getKDDIKotehiABasciServiceData);
router.get('/byokakin/kddi/customerList',  KDDIKotehiController.getKDDICustomer);
router.post('/byokakin/kddi/processedData',  KDDIKotehiController.getKDDIKotehiProcessedData);
//router.post('/byokakin/kddi/kotehi/upload_kotehi',  KDDIKotehiController.getKDDIKotehiProcessedData);



module.exports = router;
