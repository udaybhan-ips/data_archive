var router = require('express').Router();
var NTTKotehiController = require('../../../../controllers/byokakin/ntt/archive.controller');

router.post('/byokakin/ntt/kotehi',  NTTKotehiController.getNTTKotehiData);
router.post('/byokakin/ntt/kotehi/upload_kotehi_data',  NTTKotehiController.uploadNTTKotehiDataByUI);
router.post('/byokakin/ntt/kotehi/getUnRegisterdNumber',  NTTKotehiController.getUnRegisteredNTTKotehiNumberByUI);
router.post('/byokakin/ntt/kotehi/delete_kotehi_data',  NTTKotehiController.deleteNTTKotehiDataByUI);

router.post('/byokakin/ntt/kotehiPrevMonthData',  NTTKotehiController.getNTTKotehiLastMonthData);

router.post('/byokakin/ntt/kotehiPrevMonthProcessedData',  NTTKotehiController.getNTTKotehiLastMonthProcessedData);

router.post('/byokakin/ntt/addKotehiData',  NTTKotehiController.addKotehiData);
router.get('/byokakin/ntt/aServiceData',  NTTKotehiController.getNTTKotehiServiceData);
//router.get('/byokakin/ntt/aBasicCodeData',  NTTKotehiController.getNTTKotehiABasciData);
router.get('/byokakin/ntt/freeAccountNumber',  NTTKotehiController.getNTTFreeAccountNumListDetails);
router.get('/byokakin/ntt/freeDailNumber',  NTTKotehiController.getNTTFreeDialNumListDetails);

router.get('/byokakin/ntt/NNumberList',  NTTKotehiController.getNTT_N_NumList);

//router.get('/byokakin/ntt/a',  NTTKotehiController.getNTTKotehiABasciServiceData);
router.get('/byokakin/ntt/customerList',  NTTKotehiController.getNTTCustomer);
router.post('/byokakin/ntt/processedData',  NTTKotehiController.getNTTKotehiProcessedData);
router.post('/byokakin/ntt/deleteProcessedKotehiData',  NTTKotehiController.deleteKotehiProcessedData);

//router.post('/byokakin/ntt/kotehi/upload_kotehi',  NTTKotehiController.getNTTKotehiProcessedData);



module.exports = router;
