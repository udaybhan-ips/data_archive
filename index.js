// Setup environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Dependencies
var config = require('./config/config');
var express = require('./config/express');
var cors = require ('cors');
var colors = require('colors');

var jobLef = require('./controllers/cron/leafnet_cron');
var jobOut = require('./controllers/cron/sonus_outbund_cron');

// Create server
var app = express();
app.use(cors());

// testing
 jobOut.archiverJobSonusOut.start();
 jobOut.emailNotificationJobOut.start();
 jobLef.emailNotificationJob.start();
 jobLef.archiverJob.start();
// //console.log("test");
// Start listening
app.listen(config.PORT, function() {
  console.log(colors.green('Listening with ' + process.env.NODE_ENV + ' config on port ' + config.PORT));
});