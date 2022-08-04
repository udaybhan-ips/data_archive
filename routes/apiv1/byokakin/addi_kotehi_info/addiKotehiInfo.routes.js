var router = require('express').Router();
var AddiKotehiInfoController = require('../../../../controllers/byokakin/addi_kotehi_info/addiKotehiInfo.controller');

router.post('/byokakin/addi_kotehi/getAddiKotehiNumber',  AddiKotehiInfoController.getAddiKotehiInfo);
router.post('/byokakin/addi_kotehi/updateAddiKotehiNumber',  AddiKotehiInfoController.updateAddiKotehiInfo);
router.post('/byokakin/addi_kotehi/addAddiKotehiNumber',  AddiKotehiInfoController.addAddiKotehiInfo);

module.exports = router;