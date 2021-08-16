var Rate = require('../../models/sougo/rate');

module.exports = {
  addRates: async function(req, res) {
    try {
        const addRatesRes = await Rate.create(req.body);
        return res.status(200).json({
            message: 'success! rate added sucessfully',
            id: addRatesRes
          });
    } catch (error) {
        return res.status(400).json({
            message: error.message
          });
    }    
  },
  listRates: async function(req, res) {
    try {
        const listRatesRes = await Rate.findAll(req.body);
        return res.status(200).json(listRatesRes);
    } catch (error) {
        return res.status(400).json({
            message: error.message
          });
    }    
  },
  updateRates: async function(req, res) {
    try {
        const listRatesRes = await Rate.updateRates(req.body);
        return res.status(200).json(listRatesRes);
    } catch (error) {
        return res.status(400).json({
            message: error.message
          });
    }    
  },

  
//   changeName: function(req, res) {
//     User.updateName({ id: req.params.id, name: req.body.name })
//       .then(function(result) {
//         return res.status(200).json(result);
//       })
//       .catch(function(err) {
//         return res.status(400).json({
//           message: err
//         });
//       });
//   },

//   changeEmail: function(req, res) {
//     User.updateEmail({ id: req.params.id, email: req.body.email })
//       .then(function(result) {
//         return res.status(200).json(result);
//       })
//       .catch(function(err) {
//         return res.status(400).json({
//           message: err
//         });
//       });
//   },

//   changePassword: function(req, res) {
//     User.updatePassword({ id: req.params.id, password: req.body.password })
//       .then(function(result) {
//         return res.status(200).json(result);
//       })
//       .catch(function(err) {
//         return res.status(400).json({
//           message: err
//         });
//       });
//   },

//   deleteUser: function(req, res) {
//     User.delete({ id: req.params.id })
//       .then(function(result) {
//         return res.status(200).json({
//           message: 'deleted user with id: ' + result.id
//         });
//       })
//       .catch(function(err) {
//         return res.status(400).json({
//           message: err
//         });
//       });
//   },

//   getOneUser: function(req, res) {
//     User.findOne({ id: req.params.id })
//       .then(function(result) {
//         delete result.last_login_attempt;
//         delete result.login_attempts;
//         return res.status(200).json(result);
//       })
//       .catch(function(err) {
//         return res.status(400).json({
//           message: err
//         });
//       });
//   },

//   getSelfUser: function(req, res) {
//     User.findOne({ id: req.decoded.sub })
//       .then(function(result) {
//         delete result.last_login_attempt;
//         delete result.login_attempts;
//         return res.status(200).json(result);
//       })
//       .catch(function(err) {
//         return res.status(400).json({
//           message: err
//         });
//       });
//   },

//   listUsers: function(req, res) {
//     User.findAll()
//       .then(function(result) {
//         return res.status(200).json(result);
//       })
//       .catch(function(err) {
//         return res.status(400).json({
//           message: err
//         });
//       });
//   },
};