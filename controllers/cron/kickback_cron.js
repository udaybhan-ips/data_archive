var CronJob = require("cron").CronJob;
var archiveController = require('../kickback/archive.controller');
var billingController = require('../kickback/billing.controller');
var CDRsController = require('../kickback/cdr.controller');
var EmailController = require('../kickback/emailNotification.controller');

// var archiverJob = new CronJob ('42 11 * * *',function(){
//     console.log('This is kickback archiver start');
//     archiveController.getNewData();
//     console.log('This is kickback archiver End');  
// },null, true, 'Asia/Tokyo');


// var archiverJob = new CronJob ('17 12 * * *',function(){
//     console.log('This is kickback archiver start');
//     archiveController.getData();
//     console.log('This is kickback archiver End');  
// },null, true, 'Asia/Tokyo');
  
// var archiverProJob = new CronJob ('5 16 * * *',function(){
//     console.log('This is kickback Pro archiver start');
//     archiveController.getProData();
//     console.log('This is kickback Pro archiver End');  
// },null, true, 'Asia/Tokyo');

// var emailNotificationJob = new CronJob ('30 16 * * *',function(){
//     console.log('This is kickback email notification start');
//     EmailController.sendEmail();
//     console.log('This is kickback email notification end');
// },null, true, 'Asia/Tokyo'); 


// var CDRsControllerJob = new CronJob ('0 3 2 * *',function(){
//     console.log('This is kickback CDR creation start');
//     CDRsController.createCDR();
//     console.log('This is kickback CDR creation end');
// },null, true, 'Asia/Tokyo');


// var billingControllerJob = new CronJob ('33 18 * * *',function(){
//     console.log('This is kickback  billing start');
//     billingController.getData();
//     console.log('This is kickback billing end');

// },null, true, 'Asia/Tokyo');


// module.exports={};


