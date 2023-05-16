var CronJob = require("cron").CronJob;
var archiveController = require('../mvno/archive.controller');
var EmailController = require('../mvno/emailNotification.controller');
var BillingController = require('../mvno/billing.controller');
var CDRController = require('../mvno/cdr.controller');


// var archiverJobSonusOut = new CronJob ('45 15 * * *',function(){
//     console.log('You will see this message every second');
//     archiveController.getData();
//     console.log('You will see this message every second');

// },null, true, 'Asia/Tokyo');

// var archiverJobSonusOut = new CronJob ('12 23 * * *',function(){
//     console.log('You will see this message every second');
//     archiveController.getDataFPhoneALeg();
//     console.log('You will see this message every second');

// },null, true, 'Asia/Tokyo');


// var archiverJobSonusOut = new CronJob ('14 1 * * *',function(){
//     console.log('You will see this message every second');
//     archiveController.getDataFPhoneBLeg();
//     console.log('You will see this message every second');

//  },null, true, 'Asia/Tokyo');

// var archiverJobSonusOut = new CronJob ('15 2 * * *',function(){
//     console.log('You will see this message every second');
//     archiveController.getDataFPhoneALegXMOBILE();
//     console.log('You will see this message every second');

// },null, true, 'Asia/Tokyo');


//var archiverJobSonusOut = new CronJob ('9 1 * * *',function(){
//     console.log('You will see this message every second');
//     archiveController.getDataFPhoneBLegXMOBILE();
//     console.log('You will see this message every second');

// },null, true, 'Asia/Tokyo');


// var emailNotificationJobOut = new CronJob ('27 11 * * *',function(){
//     console.log('You will see this message every second');
//     EmailController.sendEmail();
//     console.log('You will see this message every second');
// },null, true, 'Asia/Tokyo');


// var BillingControllerJob = new CronJob ('50 15 * * *',function(){
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



