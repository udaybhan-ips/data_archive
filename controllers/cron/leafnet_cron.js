var CronJob = require("cron").CronJob;
var archiveController = require('../leafnet/archive.controller');
var billingController = require('../leafnet/billing.controller');
var CDRsController = require('../leafnet/cdr.controller');
var EmailController = require('../leafnet/emailNotification.controller');


// var archiverJob = new CronJob ('38 16 * * *',function(){
//     console.log('This is leafnet archiver start');
//     archiveController.getData();
//     console.log('This is leafnet archiver End');

// },null, true, 'Asia/Tokyo');


// var emailNotificationJob = new CronJob ('40 16 * * *',function(){
//     console.log('This is leafnet email notification start');
//     EmailController.sendEmail();
//     console.log('This is leafnet email notification end');

// },null, true, 'Asia/Tokyo')

// var CDRsControllerJob = new CronJob ('56 10 * * *',function(){
//     console.log('This is leafnet email notification start');
//     CDRsController.genrateCSV();
//     console.log('This is leafnet email notification end');

// },null, true, 'Asia/Tokyo');


// var billingControllerJob = new CronJob ('0 3 2 * *',function(){
//     console.log('This is leafnet  billing start');
//     billingController.getData();
//     console.log('This is leafnet email notification end');

//  },null, true, 'Asia/Tokyo');

//  var billingControllerJob = new CronJob ('54 10 * * *',function(){
//     console.log('This is leafnet  billing start');
//     billingController.getData();
//     console.log('This is leafnet email notification end');

//  },null, true, 'Asia/Tokyo');




module.exports={};


