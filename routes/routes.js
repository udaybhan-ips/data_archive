var subdomain = require('express-subdomain');
var cors = require('cors');
module.exports = function(app) {
  

  // api.localhost.com:port/
  app.use(cors());
  //app.use(subdomain('api', require('./api.routes')));
  
  // localhost:port/api/
  app.use('/api', require('./api.routes'));
  
  
  // localhost:port/
	app.use('/',  require('./web.routes'));
};