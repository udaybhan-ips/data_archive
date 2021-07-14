var _03Number = require('../../models/_03_numbers/index');

module.exports = {
  addNumber: async function(req, res) {
    try {
        const addNumberRes = await _03Number.create(req.body);
        return res.status(200).json({
            message: 'success! rate added sucessfully',
            id: addNumberRes
          });
    } catch (error) {
        return res.status(400).json({
            message: error.message
          });
    }    
  },
  listNumbers: async function(req, res) {
    try {
        const listNumbersRes = await _03Number.findAll(req.body);
        return res.status(200).json(listNumbersRes);
    } catch (error) {
        return res.status(400).json({
            message: error.message
          });
    }    
  },
  updateNumber: async function(req, res) {
    try {
        const updateNumbersRes = await _03Number.updateNumbers(req.body);
        return res.status(200).json(updateNumbersRes);
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