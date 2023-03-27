var router = require('express').Router();
var NTTORIXKotehiController = require('../../../../controllers/byokakin/ntt_orix/archive.controller');

router.post('/byokakin/ntt_orix/kotehi',  NTTORIXKotehiController.getNTTORIXKotehiData);
router.post('/byokakin/ntt_orix/kotehi/upload_kotehi_data',  NTTORIXKotehiController.uploadNTTORIXKotehiDataByUI);
router.post('/byokakin/ntt_orix/kotehi/getUnRegisterdNumber',  NTTORIXKotehiController.getUnRegisteredNTTORIXKotehiNumberByUI);
router.post('/byokakin/ntt_orix/kotehi/delete_kotehi_data',  NTTORIXKotehiController.deleteNTTORIXKotehiDataByUI);

//router.post('/byokakin/ntt_orix/kotehi/uploadKotehiData',  NTTORIXKotehiController.upload);
//router.post('/byokakin/ntt_orix/kotehiLastMonth',  NTTORIXKotehiController.getLastMonthNTTORIXKotehiData);

router.post('/byokakin/ntt_orix/kotehiPrevMonthData',  NTTORIXKotehiController.getNTTORIXKotehiLastMonthData);

router.post('/byokakin/ntt_orix/kotehiPrevMonthProcessedData',  NTTORIXKotehiController.getNTTORIXKotehiLastMonthProcessedData);

router.post('/byokakin/ntt_orix/addKotehiData',  NTTORIXKotehiController.addKotehiData);
router.get('/byokakin/ntt_orix/aServiceData',  NTTORIXKotehiController.getNTTORIXKotehiServiceData);
//router.get('/byokakin/ntt_orix/aBasicCodeData',  NTTORIXKotehiController.getNTTORIXKotehiABasciData);
router.get('/byokakin/ntt_orix/freeAccountNumber',  NTTORIXKotehiController.getNTTORIXFreeAccountNumListDetails);
router.get('/byokakin/ntt_orix/freeDailNumber',  NTTORIXKotehiController.getNTTORIXFreeDialNumListDetails);
//router.get('/byokakin/ntt_orix/a',  NTTORIXKotehiController.getNTTORIXKotehiABasciServiceData);
router.get('/byokakin/ntt_orix/customerList',  NTTORIXKotehiController.getNTTORIXCustomer);
router.post('/byokakin/ntt_orix/processedData',  NTTORIXKotehiController.getNTTORIXKotehiProcessedData);
router.post('/byokakin/ntt_orix/deleteProcessedKotehiData',  NTTORIXKotehiController.deleteKotehiProcessedData);

//router.post('/byokakin/ntt_orix/kotehi/upload_kotehi',  NTTORIXKotehiController.getNTTORIXKotehiProcessedData);



module.exports = router;
