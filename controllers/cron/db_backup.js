var CronJob = require("cron").CronJob;
var BACKUPController = require('../db_backup/dbBackup.controller');

var BACKUPControllerJob = new CronJob ('24 12 * * *',function(){
    console.log('This is db backup cron start');
    BACKUPController.cdrSonusBackup();
    console.log('This is db backup end');

},null, true, 'Asia/Tokyo');




module.exports={};


