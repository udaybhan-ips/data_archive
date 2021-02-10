var router = require('express').Router();
//var jwt = require('jsonwebtoken');

// Authentication routes
router.use(require('./auth.routes'));

// API v1
//user
router.use('/v1', require('./apiv1/user/users.routes'));
//leafnet
router.use('/v1', require('./apiv1/leafnet/rates.routes'));
router.use('/v1', require('./apiv1/leafnet/billing.summary.routes'));
router.use('/v1', require('./apiv1/leafnet/archive.data.routes'));
router.use('/v1', require('./apiv1/leafnet/invoice.routes'));
router.use('/v1', require('./apiv1/leafnet/cdr.routes'));

//sonus outbound
router.use('/v1', require('./apiv1/sonus_outbound/billing.summary.routes'));
router.use('/v1', require('./apiv1/sonus_outbound/rates.routes'));
router.use('/v1', require('./apiv1/sonus_outbound/cdr.routes'));

// API Error routes
router.use(function(req, res) {
  return res.status(404).json({
    message : "Not found."
    });
});

module.exports = router;