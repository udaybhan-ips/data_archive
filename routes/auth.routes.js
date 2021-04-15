var router = require('express').Router();
var jwt = require('jsonwebtoken');
var User = require('./../models/user/user');
var config = require('./../config/config');
var Promise = require('promise');
var usersController = require('./../controllers/user/users.controller');

// Registration of new users via API

router.post('/auth/register', usersController.createUser);

// Authentication to obtain a token
router.post('/auth/authenticate', function(req, res) {
  User.authenticate(req.body)
    .then(function(result) {
      //console.log(result)
      if (result.isAuthorized === true) {
        jwt.sign({ sub: result.id }, config.SECRET, { expiresIn: config.JWT_EXPIRATION, issuer: 'masterLord' }, function(err,token) {
          if(err){
            console.log(err);
          }
          return res.status(200).json({
            message: 'authenticated, token attached',
            token: token,
            role:result.role
          });
        });
      }
      else {
        return res.status(401).json({
          message: 'bad credentials'
        });
      }
    })
    .catch(function(err) {
      return res.status(400).json({
        message: err
      });
    });
});

// Any route past this point requires a valid auth token

router.use(function(req, res, next) {
  
  console.log("test");
  console.log(req.headers);

  var token = req.body.token || req.query.token || req.headers['authorization'];
  console.log(token);
  console.log(config.SECRET);
  if (token) {
    jwt.verify(token, config.SECRET, function(err, decoded) {

      if (err) {
        console.log(err);
        return res.status(401).json({
          message: 'failed authentication: invalid token'
        });
      }
      User.findOne({ 'id': decoded.sub })
        .then(function(user) {
          req.decoded = decoded;
          next();
        })
        .catch(function(err) {
          return res.status(401).json({
            message: 'failed authentication: ' + err
          });
        });
    });
  }
  else {
    return res.status(401).json({
      message: 'failed authentication: no token provided.'
    });
  }
});

module.exports = router;