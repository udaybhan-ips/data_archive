var router = require('express').Router();
var CompanyController = require('../../../controllers/kickback/companyInfo.controller');

router.get('/kickback/getCompanyInfo',  CompanyController.getCompanyInfo);
router.post('/kickback/addCompanyInfo',  CompanyController.addCompany);
router.post('/kickback/updateCompanyInfo',  CompanyController.updateCompany);


module.exports = router;