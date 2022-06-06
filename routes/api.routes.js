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
router.use('/v1', require('./apiv1/leafnet/approval.routes'));

//sonus outbound
router.use('/v1', require('./apiv1/sonus_outbound/billing.summary.routes'));
router.use('/v1', require('./apiv1/sonus_outbound/rates.routes'));
router.use('/v1', require('./apiv1/sonus_outbound/cdr.routes'));
router.use('/v1', require('./apiv1/sonus_outbound/approval.routes'));
router.use('/v1', require('./apiv1/sonus_outbound/archive.data.routes'));


/** Customer details **/

router.use('/v1', require('./apiv1/customer/customers.routes'));


/**** Byokakin  ******/

/**** KDDI *****/

router.use('/v1', require('./apiv1/byokakin/kddi/kotehi.routes'));
router.use('/v1', require('./apiv1/byokakin/kddi/summary.routes'));

/**** NTT *****/

router.use('/v1', require('./apiv1/byokakin/ntt/kotehi.routes'));
router.use('/v1', require('./apiv1/byokakin/ntt/summary.routes'));


/** 03 numbers  details **/

router.use('/v1', require('./apiv1/_03numbers/_03numbers.routes'));

/** Kickback **/

router.use('/v1', require('./apiv1/kickback/rates.routes'));
router.use('/v1', require('./apiv1/kickback/billing.summary.routes'));
router.use('/v1', require('./apiv1/kickback/archive.data.routes'));
router.use('/v1', require('./apiv1/kickback/invoice.routes'));
router.use('/v1', require('./apiv1/kickback/cdr.routes'));
router.use('/v1', require('./apiv1/kickback/approval.routes'));


/** sougo **/

router.use('/v1', require('./apiv1/sougo/rates.routes'));
router.use('/v1', require('./apiv1/sougo/invoice.routes'));
router.use('/v1', require('./apiv1/sougo/route.routes'))
router.use('/v1', require('./apiv1/sougo/company.routes'))
router.use('/v1', require('./apiv1/sougo/carrier.routes'))
router.use('/v1', require('./apiv1/sougo/approval.routes'));


/** mvno **/


router.use('/v1', require('./apiv1/mvno/invoice.routes'));
router.use('/v1', require('./apiv1/mvno/archive.data.routes'));
// router.use('/v1', require('./apiv1/sougo/route.routes'))
// router.use('/v1', require('./apiv1/sougo/company.routes'))
//router.use('/v1', require('./apiv1/sougo/carrier.routes'))
router.use('/v1', require('./apiv1/mvno/approval.routes'));



// API Error routes
router.use(function(req, res) {
  return res.status(404).json({
    message : "Not found."
    });
});

module.exports = router;