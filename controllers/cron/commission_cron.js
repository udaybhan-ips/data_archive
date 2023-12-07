var CronJob = require("cron").CronJob;
//var archiveController = require('../commission/commissionInfo.controller');
// var billingController = require('../commission/billing.controller');
// var CDRsController = require('../commission/cdr.controller');
 var EmailController = require('../commission/emailNotification.controller');

//  var emailNotificationJob = new CronJob ('47 18 * * *',function(){
//      console.log('This is commission email notification start');
//      EmailController.sendEmail();
//      console.log('This is commission email notification end');

//  },null, true, 'Asia/Tokyo')

// var archiverJob = new CronJob ('38 22 * * *',function(){
//     console.log('This is commission archiver start');
//     archiveController.getData();
//     console.log('This is commission archiver End');
// },null, true, 'Asia/Tokyo');



// var CDRsControllerJob = new CronJob ('18 14 * * *',function(){
//     console.log('This is commission email notification start');
//     CDRsController.genrateCSV();
//     console.log('This is commission email notification end');

// },null, true, 'Asia/Tokyo');


// var billingControllerJob = new CronJob ('14 14 * * *',function(){
//     console.log('This is commission  billing start');
//     billingController.getData();
//     console.log('This is commission email notification end');

//  },null, true, 'Asia/Tokyo');




module.exports={};


