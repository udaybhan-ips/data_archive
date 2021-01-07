var CronJob = require("cron").CronJob;
var archiveController = require('../sonus_outbound/archive.controller');
var billingController = require('../leafnet/billing.controller');
var CDRsController = require('../leafnet/cdrExtraction.controller');
var EmailController = require('../sonus_outbound/emailNotification.controller');


var archiverJobSonusOut = new CronJob ('58 16 * * *',function(){
    console.log('You will see this message every second');
    archiveController.getData();
    console.log('You will see this message every second');

},null, true, 'Asia/Tokyo');






var emailNotificationJobOut = new CronJob ('57 17 * * *',function(){
    console.log('You will see this message every second');
    EmailController.sendEmail();
    console.log('You will see this message every second');

},null, true, 'Asia/Tokyo');



module.exports={archiverJobSonusOut,emailNotificationJobOut};



