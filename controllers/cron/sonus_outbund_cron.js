var CronJob = require("cron").CronJob;
var archiveController = require('../sonus_outbound/archive.controller');
var EmailController = require('../sonus_outbound/emailNotification.controller');
var BillingController = require('../sonus_outbound/billing.controller');
var CDRController = require('../sonus_outbound/cdr.controller');


// var archiverJobSonusOut = new CronJob ('49 17 * * *',function(){
//     console.log('You will see this message every second');
//     archiveController.getData();
//     console.log('You will see this message every second');

// },null, true, 'Asia/Tokyo');


// var emailNotificationJobOut = new CronJob ('23 14 * * *',function(){
//     console.log('You will see this message every second');
//     EmailController.sendEmail();
//     console.log('You will see this message every second');
// },null, true, 'Asia/Tokyo');


// var BillingControllerJob = new CronJob ('11 12 * * *',function(){
//     console.log('You will see this message every second');
//     BillingController.getData();
//     console.log('You will see this message every second');
// },null, true, 'Asia/Tokyo');

// var CDRControllerJob = new CronJob ('18 10 * * *',function(){
//     console.log('You will see this message every second');
//     CDRController.createCDR();
//     console.log('You will see this message every second');
// },null, true, 'Asia/Tokyo');



module.exports={};



