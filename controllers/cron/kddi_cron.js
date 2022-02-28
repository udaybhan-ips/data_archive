var CronJob = require("cron").CronJob;
var archiveController = require('../byokakin/kddi/archive.controller');
// var billingController = require('../byokakin/kddi/billing.controller');
// var CDRsController = require('../byokakin/kddi/cdr.controller');
// var EmailController = require('../byokakin/emailNotification.controller');

// var archiverJob = new CronJob ('59 10 * * *',function(){
//     console.log('This is byokakin archiver start');
//     archiveController.uploadKotehiKDDI();
//     console.log('This is byokakin archiver End');  
// },null, true, 'Asia/Tokyo');
 
// var archiverJob = new CronJob ('37 12 * * *',function(){
//     console.log('This is byokakin archiver start');
//     archiveController.uploadKDDIRAW();
//     console.log('This is byokakin archiver End');  
// },null, true, 'Asia/Tokyo');


// var emailNotificationJob = new CronJob ('30 17 * * *',function(){
//     console.log('This is byokakin email notification start');
//     EmailController.sendEmail();
//     console.log('This is byokakin email notification end');

// },null, true, 'Asia/Tokyo');

// var CDRsControllerJob = new CronJob ('31 11 * * *',function(){
//     console.log('This is byokakin email notification start');
//     CDRsController.createCDR();
//     console.log('This is byokakin email notification end');

// },null, true, 'Asia/Tokyo');


// var billingControllerJob = new CronJob ('11 13 * * *',function(){
//     console.log('This is byokakin  billing start');
//     billingController.getData();
//     console.log('This is byokakin email notification end');

// },null, true, 'Asia/Tokyo');




module.exports={};


