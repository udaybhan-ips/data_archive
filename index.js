// Setup environment
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Dependencies
var config = require('./config/config');
var express = require('./config/express');
var cors = require ('cors');
var colors = require('colors');



var jobLef = require('./controllers/cron/leafnet_cron');
var jobSonusOut = require('./controllers/cron/sonus_outbund_cron');
var jobKickback = require('./controllers/cron/kickback_cron');
var jobSougo = require('./controllers/cron/sougo_cron');
var jobMVNO = require('./controllers/cron/mvno_cron');
var KDDI = require('./controllers/cron/kddi_cron');
var NTT = require('./controllers/cron/ntt_cron');
var NTTORIX = require('./controllers/cron/ntt_orix_cron');
var DBBACKUP = require('./controllers/cron/db_backup');
var jobComsq = require('./controllers/cron/comsq_cron');
var jobDMS = require('./controllers/cron/dms_cron');



const dbSqlz = require("./models");


// Create server
var app = express();

app.use(cors());
// dbSqlz.sequelize.sync();

// testing
 // jobSonusOut.archiverJobSonusOut.start();
//    jobSonusOut.emailNotificationJobOut.start();
//  jobLef.emailNotificationJob.start();
  //jobLef.archiverJob.start();
// //console.log("test");
// Start listening




const server = app.listen(config.PORT, function() {
  console.log(colors.green('Listening with ' + process.env.NODE_ENV + ' config on port ' + config.PORT));
});

server.timeout = 2400000;