var CronJob = require("cron").CronJob;
var archiveController = require('../leafnet/archive.controller');
var billingController = require('../leafnet/billing.controller');
var CDRsController = require('../leafnet/cdrExtraction.controller');
var EmailController = require('../leafnet/emailNotification.controller');


var archiverJob = new CronJob ('1 3 * * *',function(){
    console.log('You will see this message every second');
    archiveController.getData();
    console.log('You will see this message every second');

},null, true, 'Asia/Tokyo');





var emailNotificationJob = new CronJob ('30 3 * * *',function(){
    console.log('You will see this message every second');
    EmailController.sendEmail();
    console.log('You will see this message every second');

},null, true, 'Asia/Tokyo');



module.exports={emailNotificationJob,archiverJob};


