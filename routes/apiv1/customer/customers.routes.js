var router = require('express').Router();
var customerController = require('./../../../controllers/customer/customer.controller');

router.get('/customer',  customerController.listCustomers);
router.post('/customer/addCustomer', customerController.createUser);
// router.get('/users/me',  usersController.getSelfUser);
// router.get('/users/:id', usersController.getOneUser);
// router.put('/users/:id/name', usersController.changeName);
// router.put('/users/:id/password', usersController.changePassword);
// router.put('/users/:id/email', usersController.changeEmail);
router.post('/customer/deleteCustomer', customerController.deleteUser);

router.get('/customer/users_list',  customerController.listUsers);


module.exports = router;