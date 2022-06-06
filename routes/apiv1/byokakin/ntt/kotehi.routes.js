var router = require('express').Router();
var NTTKotehiController = require('../../../../controllers/byokakin/ntt/archive.controller');

router.post('/byokakin/ntt/kotehi',  NTTKotehiController.getNTTKotehiData);
//router.post('/byokakin/ntt/kotehi/uploadKotehiData',  NTTKotehiController.upload);
//router.post('/byokakin/ntt/kotehiLastMonth',  NTTKotehiController.getLastMonthNTTKotehiData);

router.post('/byokakin/ntt/kotehiPrevMonthData',  NTTKotehiController.getNTTKotehiLastMonthData);

router.post('/byokakin/ntt/kotehiPrevMonthProcessedData',  NTTKotehiController.getNTTKotehiLastMonthProcessedData);

router.post('/byokakin/ntt/addKotehiData',  NTTKotehiController.addKotehiData);
router.get('/byokakin/ntt/aServiceCodeData',  NTTKotehiController.getNTTKotehiAServiceDataData);
router.get('/byokakin/ntt/aBasicCodeData',  NTTKotehiController.getNTTKotehiABasciData);
router.get('/byokakin/ntt/freeAccountNumber',  NTTKotehiController.getNTTFreeAccountNumListDetails);
router.get('/byokakin/ntt/freeDailNumber',  NTTKotehiController.getNTTFreeDialNumListDetails);
router.get('/byokakin/ntt/aBasicServiceData',  NTTKotehiController.getNTTKotehiABasciServiceData);
router.get('/byokakin/ntt/customerList',  NTTKotehiController.getNTTCustomer);
router.post('/byokakin/ntt/processedData',  NTTKotehiController.getNTTKotehiProcessedData);
router.post('/byokakin/ntt/deleteProcessedKotehiData',  NTTKotehiController.deleteKotehiProcessedData);

//router.post('/byokakin/ntt/kotehi/upload_kotehi',  NTTKotehiController.getNTTKotehiProcessedData);



module.exports = router;
