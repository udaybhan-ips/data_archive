var router = require('express').Router();
var SougoRouteController = require('../../../controllers/sougo/route.controller');

router.get('/sougo/route',  SougoRouteController.listRoutes);
router.post('/sougo/route/add_route', SougoRouteController.addRoutes);
router.post('/sougo/route/update_route', SougoRouteController.updateRoutes);

module.exports = router;