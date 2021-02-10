var CronJob = require("cron").CronJob;
var archiveController = require('../leafnet/archive.controller');
var billingController = require('../leafnet/billing.controller');
var CDRsController = require('../leafnet/cdrExtraction.controller');
var EmailController = require('../leafnet/emailNotification.controller');


var archiverJob = new CronJob ('33 12 * * *',function(){
    console.log('This is leafnet archiver start');
    archiveController.getData();
    console.log('This is leafnet archiver End');

},null, true, 'Asia/Tokyo');





var emailNotificationJob = new CronJob ('2 13 * * *',function(){
    console.log('This is leafnet email notification start');
    EmailController.sendEmail();
    console.log('This is leafnet email notification end');

},null, true, 'Asia/Tokyo');



module.exports={archiverJob,emailNotificationJob};

