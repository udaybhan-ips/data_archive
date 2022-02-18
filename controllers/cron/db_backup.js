var CronJob = require("cron").CronJob;
var BACKUPController = require('../db_backup/dbBackup.controller');

// var BACKUPControllerJob = new CronJob ('1 0 * * *',function(){
//     console.log('This is db backup cron start');
//     BACKUPController.cdrSonusBackup();
//     console.log('This is db backup end');

// },null, true, 'Asia/Tokyo');

// var BACKUPControllerJob = new CronJob ('1 1 * * *',function(){
//     console.log('This is db backup cron start');
//     BACKUPController.cdrIBSBackup();
//     console.log('This is db backup end');

// },null, true, 'Asia/Tokyo');



module.exports={};


