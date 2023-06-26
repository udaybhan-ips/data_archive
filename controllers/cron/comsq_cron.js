var CronJob = require("cron").CronJob;
var archiveController = require('../comsq/archive.controller');
// var billingController = require('../comsq/billing.controller');
// var CDRsController = require('../comsq/cdr.controller');
// var EmailController = require('../comsq/emailNotification.controller');


// var archiverJob = new CronJob ('16 17 * * *',function(){
//     console.log('This is comsq archiver start');
//     archiveController.getData();
//     console.log('This is comsq archiver End');
// },null, true, 'Asia/Tokyo');


// var emailNotificationJob = new CronJob ('47 18 * * *',function(){
//     console.log('This is comsq email notification start');
//     EmailController.sendEmail();
//     console.log('This is comsq email notification end');

// },null, true, 'Asia/Tokyo')

// var CDRsControllerJob = new CronJob ('18 14 * * *',function(){
//     console.log('This is comsq email notification start');
//     CDRsController.genrateCSV();
//     console.log('This is comsq email notification end');

// },null, true, 'Asia/Tokyo');


// var billingControllerJob = new CronJob ('14 14 * * *',function(){
//     console.log('This is comsq  billing start');
//     billingController.getData();
//     console.log('This is comsq email notification end');

//  },null, true, 'Asia/Tokyo');




module.exports={};


