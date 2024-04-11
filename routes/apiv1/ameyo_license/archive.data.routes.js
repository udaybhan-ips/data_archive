var router = require('express').Router();
var archiveController = require('./../../../controllers/ameyo_license/archive.controller');

router.get('/ameyo_license/getLastMonthData',  archiveController.getLastMonthData);
router.post('/ameyo_license/addMonthlyData',  archiveController.addMonthlyData);
router.post('/ameyo_license/updateMonthlyData',  archiveController.updateMonthlyData);

router.post('/ameyo_license/addMonthlySingleData',  archiveController.addMonthlySingleData);
router.post('/ameyo_license/updateMonthlySingleData',  archiveController.updateMonthlySingleData);




module.exports = router;