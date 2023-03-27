var CronJob = require("cron").CronJob;
var archiveController = require('../dms/archive.controller');
// var billingController = require('../dms/billing.controller');
// var CDRsController = require('../dms/cdr.controller');
// var EmailController = require('../dms/emailNotification.controller');


// var archiverJob = new CronJob ('28 16 * * *',function(){
//     console.log('This is dms archiver start');
//     archiveController.getData();
//     console.log('This is dms archiver End');
// },null, true, 'Asia/Tokyo');


// var emailNotificationJob = new CronJob ('47 18 * * *',function(){
//     console.log('This is dms email notification start');
//     EmailController.sendEmail();
//     console.log('This is dms email notification end');

// },null, true, 'Asia/Tokyo')

// var CDRsControllerJob = new CronJob ('18 14 * * *',function(){
//     console.log('This is dms email notification start');
//     CDRsController.genrateCSV();
//     console.log('This is dms email notification end');

// },null, true, 'Asia/Tokyo');


// var billingControllerJob = new CronJob ('14 14 * * *',function(){
//     console.log('This is dms  billing start');
//     billingController.getData();
//     console.log('This is dms email notification end');

//  },null, true, 'Asia/Tokyo');




module.exports={};


