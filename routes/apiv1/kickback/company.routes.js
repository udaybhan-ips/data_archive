var router = require('express').Router();
var CompanyController = require('../../../controllers/kickback/companyInfo.controller');

router.get('/kickback/getCompanyInfo',  CompanyController.getCompanyInfo);
router.post('/kickback/addCompanyInfo',  CompanyController.addCompany);
router.post('/kickback/updateCompanyInfo',  CompanyController.updateCompany);
router.get('/kickback/getKICKBACKConfigEmailInfo',  CompanyController.getKICKBACKConfigEmailInfo);
router.post('/kickback/addKICKBACKConfigEmailInfo',  CompanyController.addKICKBACKConfigEmailInfo);
router.post('/kickback/updateKICKBACKConfigEmailInfo',  CompanyController.updateKICKBACKConfigEmailInfo);


module.exports = router;