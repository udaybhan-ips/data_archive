var CronJob = require("cron").CronJob;
var archiveController = require('../leafnet/archive.controller');
var billingController = require('../leafnet/billing.controller');


// var job = new CronJob ('55 17 * * *',function(){
//     console.log('You will see this message every second');
//     archiveController.getData();
//     console.log('You will see this message every second');

// },null, true, 'Asia/Tokyo');


var job = new CronJob ('0 */12 * * *',function(){
    console.log('You will see this message every second');
    archiveController.getData();
    console.log('You will see this message every second');

},null, true, 'Asia/Tokyo');



module.exports=job;



