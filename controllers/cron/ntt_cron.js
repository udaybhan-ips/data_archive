var CronJob = require("cron").CronJob;
var archiveController = require('../byokakin/ntt/archive.controller');
var billingController = require('../byokakin/ntt/billing.controller');
var CDRsController = require('../byokakin/ntt/cdr.controller');
// var EmailController = require('../byokakin/emailNotification.controller');

// var archiverJob = new CronJob ('17 10 * * *',function(){
//     console.log('This is byokakin NTT archiver start');
//     archiveController.uploadKotehiNTT();
//     console.log('This is byokakin NTT archiver End');  
// },null, true, 'Asia/Tokyo');

// var archiverJob = new CronJob ('23 10 * * *',function(){
//     console.log('This is byokakin NTT archiver start');
//     archiveController.NTTKotehiCharge();
//     console.log('This is byokakin NTT archiver End');  
// },null, true, 'Asia/Tokyo');

// var archiverJob = new CronJob ('27 17 * * *',function(){
//     console.log('This is byokakin archiver start');
//     archiveController.uploadNTTRAW();
//     console.log('This is byokakin archiver End');  
// },null, true, 'Asia/Tokyo');


// var CDRProcessingControllerJob = new CronJob ('16 18 * * *',function(){
//     console.log('This is byokakin  billing start');
//     billingController.cdrProcessing();
//     console.log('This is byokakin email notification end');
// },null, true, 'Asia/Tokyo');

// var billingControllerJob = new CronJob ('53 17 * * *',function(){
//     console.log('This is byokakin  billing start');
//     billingController.getData();
//     console.log('This is byokakin email notification end');
// },null, true, 'Asia/Tokyo');

 


// var emailNotificationJob = new CronJob ('47 15 * * *',function(){
//     console.log('This is byokakin email notification start');
//     EmailController.sendEmail();
//     console.log('This is byokakin email notification end');

// },null, true, 'Asia/Tokyo');

// var CDRsControllerJob = new CronJob ('1 12 * * *',function(){
//     console.log('This is byokakin email notification start');
//     CDRsController.createCDR();
//     console.log('This is byokakin email notification end');

// },null, true, 'Asia/Tokyo');






module.exports={};


