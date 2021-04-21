var CronJob = require("cron").CronJob;
var archiveController = require('../sonus_outbound/archive.controller');
var EmailController = require('../sonus_outbound/emailNotification.controller');
var BillingController = require('../sonus_outbound/billing.controller');
var CDRController = require('../sonus_outbound/cdr.controller');


// var archiverJobSonusOut = new CronJob ('1 2 * * *',function(){
//     console.log('You will see this message every second');
//     archiveController.getData();
//     console.log('You will see this message every second');

// },null, true, 'Asia/Tokyo');


// var emailNotificationJobOut = new CronJob ('46 4 * * *',function(){
//     console.log('You will see this message every second');
//     EmailController.sendEmail();
//     console.log('You will see this message every second');
// },null, true, 'Asia/Tokyo');


// var BillingControllerJob = new CronJob ('8 15 * * *',function(){
//     console.log('You will see this message every second');
//     BillingController.getData();
//     console.log('You will see this message every second');
// },null, true, 'Asia/Tokyo');

// var BCDRControllerJob = new CronJob ('20 15 * * *',function(){
//     console.log('You will see this message every second');
//     CDRController.createCDR();
//     console.log('You will see this message every second');
// },null, true, 'Asia/Tokyo');



module.exports={};



