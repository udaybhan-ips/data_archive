var CronJob = require("cron").CronJob;
var archiveController = require('../kickback/archive.controller');
var billingController = require('../kickback/billing.controller');
var CDRsController = require('../kickback/cdr.controller');
var EmailController = require('../kickback/emailNotification.controller');

// var archiverJob = new CronJob ('31 1 * * *',function(){
//     console.log('This is kickback archiver start');
//     archiveController.getNewData();
//     console.log('This is kickback archiver End');  
// },null, true, 'Asia/Tokyo');

// this is 3rd
// var archiverJob = new CronJob ('4 11 * * *',function(){
//     console.log('This is kickback archiver start');
//     archiveController.getData();
//     console.log('This is kickback archiver End');  
// },null, true, 'Asia/Tokyo');

// this is 4th
  
// var archiverProJob = new CronJob ('30 11 * * *',function(){
//     console.log('This is kickback Pro archiver start');
//     archiveController.getProData();
//     console.log('This is kickback Pro archiver End');  
// },null, true, 'Asia/Tokyo');

// var emailNotificationJob = new CronJob ('48 11 * * *',function(){
//     console.log('This is kickback email notification start');
//     EmailController.sendEmail();
//     console.log('This is kickback email notification end');
// },null, true, 'Asia/Tokyo'); 


// var CDRsControllerJob = new CronJob ('0 3 2 * *',function(){
//     console.log('This is kickback CDR creation start');
//     CDRsController.createCDR();
//     console.log('This is kickback CDR creation end');
// },null, true, 'Asia/Tokyo');


// var billingControllerJob = new CronJob ('36 10 * * *',function(){
//     console.log('This is kickback  billing start');
//     billingController.getData();
//     console.log('This is kickback billing end');

// },null, true, 'Asia/Tokyo');


// var billingControllerJob = new CronJob ('35 23 * * *',function(){
//     console.log('This is kickback  billing start');
//     billingController.newIPdata();
//     console.log('This is kickback billing end');

// },null, true, 'Asia/Tokyo');




// module.exports={};


