var router = require('express').Router();
var _03numbersController = require('../../../controllers/_03numbers/_03numbers.controller');

router.post('/number',  _03numbersController.listNumbers);
router.post('/_03numbers/addnumber', _03numbersController.addNumber);
// router.get('/users/me',  usersController.getSelfUser);
// router.get('/users/:id', usersController.getOneUser);
// router.put('/users/:id/name', usersController.changeName);
// router.put('/users/:id/password', usersController.changePassword);
// router.put('/users/:id/email', usersController.changeEmail);
//router.post('/customer/deleteCustomer', _03numbersController.deleteUser);

router.get('/_03numbers/users_list',  _03numbersController.listNumbers);


module.exports = router;