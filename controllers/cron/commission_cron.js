var CronJob = require("cron").CronJob;
var billingController = require('../commission/commissionInfo.controller');
var EmailController = require('../commission/emailNotification.controller');

//  var emailNotificationJob = new CronJob ('0 10 * * *',function(){
//      console.log('This is commission email notification start');
//      EmailController.sendEmail();
//      console.log('This is commission email notification end');

//  },null, true, 'Asia/Tokyo')

// var billingControllerJob = new CronJob ('28 11 * * *',function(){
//     console.log('This is commission  billing start');
//     billingController.getData();
//     console.log('This is commission email notification end');

//  },null, true, 'Asia/Tokyo');




module.exports={};


