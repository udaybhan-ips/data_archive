// Setup environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Dependencies
var config = require('./config/config');
var express = require('./config/express');
var cors = require ('cors');
var colors = require('colors');

var jobLef = require('./controllers/cron/leafnet_cron');
var jobSonusOut = require('./controllers/cron/sonus_outbund_cron');
var timeout = require('connect-timeout');

// Create server
var app = express();

//app.use(cors());


// testing
  jobSonusOut.archiverJobSonusOut.start();
//    jobSonusOut.emailNotificationJobOut.start();
//  jobLef.emailNotificationJob.start();
  //jobLef.archiverJob.start();
// //console.log("test");
// Start listening



const server = app.listen(config.PORT, function() {
  console.log(colors.green('Listening with ' + process.env.NODE_ENV + ' config on port ' + config.PORT));
});

server.timeout = 2400000;