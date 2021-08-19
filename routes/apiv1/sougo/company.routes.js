var router = require('express').Router();
var SougoCompanyController = require('../../../controllers/sougo/company.controller');

router.get('/sougo/company',  SougoCompanyController.listCompany);
router.post('/sougo/company/add_company', SougoCompanyController.addCompany);
router.post('/sougo/company/update_company', SougoCompanyController.updateCompany);

module.exports = router;