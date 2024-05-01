var router = require('express').Router();
var SummaryController = require('../../../controllers/ameyo_license/summary.controller');

router.get('/ameyo_license/invoice_data',  SummaryController.getSummary);
router.post('/ameyo_license/getSummaryDataByMonth',  SummaryController.getSummaryByMonth);
router.post('/ameyo_license/getDetailDataByMonth',  SummaryController.getDetailsDataByMonth);

router.get('/ameyo_license/all_data',  SummaryController.getALLAmeyoData);
router.get('/ameyo_license/all_product_data',  SummaryController.getALLAmeyoProductData);
router.post('/ameyo_license/get_processed_data',  SummaryController.getAmeyoProcessedData);

router.post('/ameyo_license/add_ameyo_product_item',  SummaryController.addAmeyoProductItemData);
router.post('/ameyo_license/update_ameyo_product_item',  SummaryController.updateAmeyoProductItemData);





module.exports = router;