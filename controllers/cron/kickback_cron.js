var CronJob = require("cron").CronJob;
var archiveController = require('../kickback/archive.controller');
var billingController = require('../kickback/billing.controller');
var CDRsController = require('../kickback/cdr.controller');
var EmailController = require('../kickback/emailNotification.controller');


// var archiverJob = new CronJob ('22 10 * * *',function(){
//     console.log('This is kickback archiver start');
//     archiveController.getData();
//     console.log('This is kickback archiver End');
// },null, true, 'Asia/Tokyo');





// var emailNotificationJob = new CronJob ('29 10 * * *',function(){
//     console.log('This is kickback email notification start');
//     EmailController.sendEmail();
//     console.log('This is kickback email notification end');

// },null, true, 'Asia/Tokyo');

var CDRsControllerJob = new CronJob ('55 11 * * *',function(){
    console.log('This is kickback email notification start');
    CDRsController.createCDR();
    console.log('This is kickback email notification end');

},null, true, 'Asia/Tokyo');


// var billingControllerJob = new CronJob ('16 15 * * *',function(){
//     console.log('This is kickback  billing start');
//     billingController.getData();
//     console.log('This is kickback email notification end');

// },null, true, 'Asia/Tokyo');




module.exports={};


