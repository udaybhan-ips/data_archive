var CronJob = require("cron").CronJob;
var archiveController = require('../byokakin/ntt_orix/archive.controller');
var billingController = require('../byokakin/ntt_orix/billing.controller');
var CDRsController = require('../byokakin/ntt_orix/cdr.controller');
// var EmailController = require('../byokakin/emailNotification.controller');

// var archiverJob = new CronJob ('14 13 * * *',function(){
//     console.log('This is byokakin NTTORIX archiver start');
//     archiveController.uploadKotehiNTTORIX();
//     console.log('This is byokakin NTTORIX archiver End');  
// },null, true, 'Asia/Tokyo');

// var archiverJob = new CronJob ('16 13 * * *',function(){
//     console.log('This is byokakin NTTORIX archiver start');
//     archiveController.NTTORIXKotehiCharge();
//     console.log('This is byokakin NTTORIX archiver End');  
// },null, true, 'Asia/Tokyo');

// var archiverJob = new CronJob ('19 13 * * *',function(){
//     console.log('This is byokakin archiver start');
//     archiveController.uploadNTTORIXRAW();
//     console.log('This is byokakin archiver End');  
// },null, true, 'Asia/Tokyo');

// var CDRProcessingControllerJob = new CronJob ('21 13 * * *',function(){
//     console.log('This is byokakin  billing start');
//     billingController.cdrProcessing();
//     console.log('This is byokakin email notification end');
// },null, true, 'Asia/Tokyo');

// var billingControllerJob = new CronJob ('5 17 * * *',function(){
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


