var CronJob = require("cron").CronJob;
var archiveController = require('../leafnet/archive.controller');
var billingController = require('../leafnet/billing.controller');
var CDRsController = require('../leafnet/cdr.controller');
var EmailController = require('../leafnet/emailNotification.controller');


var archiverJob = new CronJob ('40 9 * * *',function(){
    console.log('This is leafnet archiver start');
    archiveController.getData();
    console.log('This is leafnet archiver End');

},null, true, 'Asia/Tokyo');





// var emailNotificationJob = new CronJob ('1 8 * * *',function(){
//     console.log('This is leafnet email notification start');
//     EmailController.sendEmail();
//     console.log('This is leafnet email notification end');

// },null, true, 'Asia/Tokyo');

// var CDRsControllerJob = new CronJob ('27 16 * * *',function(){
//     console.log('This is leafnet email notification start');
//     CDRsController.genrateCSV();
//     console.log('This is leafnet email notification end');

// },null, true, 'Asia/Tokyo');


// var billingControllerJob = new CronJob ('45 17 * * *',function(){
//     console.log('This is leafnet  billing start');
//     billingController.getData();
//     console.log('This is leafnet email notification end');

// },null, true, 'Asia/Tokyo');




module.exports={};


