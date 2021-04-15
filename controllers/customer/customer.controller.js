var Customer = require('../../models/customer/customer');

module.exports = {
  createUser: function(req, res) {
    
    Customer.create(req.body)
      .then(function(result) {
        return res.status(200).json({
          message: 'success! customer added',
         // id: result.id
        });
      })
      .catch(function(err) {
        return res.status(400).json({
          message: err.message
        });
      });
  },

  udpateCustomerInfo: function(req, res) {
    Customer.updateCustomerInfo(req.body)
      .then(function(result) {
        return res.status(200).json(result);
      })
      .catch(function(err) {
        return res.status(400).json({
          message: err
        });
      });
  },

  
  deleteUser: function(req, res) {

    Customer.delete(req.body)
      .then(function(result) {
        return res.status(200).json({
          message: 'deleted user with id: ' + result.id
        });
      })
      .catch(function(err) {
        return res.status(400).json({
          message: err
        });
      });
  },

  
  listCustomers: function(req, res) {
    console.log("list users")
    Customer.findAll()
      .then(function(result) {
        return res.status(200).json(result);
      })
      .catch(function(err) {
        return res.status(400).json({
          message: err
        });
      });
  },
};