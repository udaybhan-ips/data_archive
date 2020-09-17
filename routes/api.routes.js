var router = require('express').Router();
//var jwt = require('jsonwebtoken');

// Authentication routes
//router.use(require('./auth.routes'));

// API v1
router.use('/v1', require('./apiv1/users.routes'));
router.use('/v1', require('./apiv1/rates.routes'));
router.use('/v1', require('./apiv1/leafnet/archive.data.routes'));

// API Error routes
router.use(function(req, res) {
  return res.status(404).json({
    message : "Not found."
    });
});

module.exports = router;