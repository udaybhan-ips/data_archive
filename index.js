// Setup environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Dependencies
var config = require('./config/config');
var express = require('./config/express');
var cors = require ('cors');
var colors = require('colors');
var job = require('./controllers/cron/leafnet_cron')
// Create server
var app = express();
ap3
p.use(cors());

// testing


job.start();
//console.log("test");
// Start listening
app.listen(config.PORT, function() {
  console.log(colors.green('Listening with ' + process.env.NODE_ENV + ' config on port ' + config.PORT));
});