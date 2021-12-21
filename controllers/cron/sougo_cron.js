var CronJob = require("cron").CronJob;
var archiveController = require('../sougo/archive.controller');
var billingController = require('../sougo/billing.controller');
var CDRsController = require('../sougo/cdr.controller');
var EmailController = require('../sougo/emailNotification.controller');


// var archiverJob = new CronJob ('22 13 * * *',function(){
//     console.log('This is sougo archiver start');
//     archiveController.getData();
//     console.log('This is sougo archiver End');
// },null, true, 'Asia/Tokyo');





// var emailNotificationJob = new CronJob ('29 10 * * *',function(){
//     console.log('This is sougo email notification start');
//     EmailController.sendEmail();
//     console.log('This is sougo email notification end');

// },null, true, 'Asia/Tokyo');

// var CDRsControllerJob = new CronJob ('55 11 * * *',function(){
//     console.log('This is sougo email notification start');
//     CDRsController.createCDR();
//     console.log('This is sougo email notification end');

// },null, true, 'Asia/Tokyo');


// var billingControllerJob = new CronJob ('40 14 * * *',function(){
//     console.log('This is sougo  billing start');
//     billingController.getData();
//     console.log('This is sougo email notification end');

// },null, true, 'Asia/Tokyo');




module.exports={};


