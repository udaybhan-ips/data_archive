var DBBACKUP = require('../../models/db_backup/db_backup');

module.exports = {
    startDBbackup: async function(req, res) {
    try {
        const [startDBbackupDailyRes,startDBbackupDailyErr] = await handleError(DBBACKUP.startDBbackupDaily());
        if(startDBbackupDailyErr) {
            console.log("there is error in dumping")           
        }
        
        console.log("dumping finished..")
        
    } catch (error) {
      console.log('error while dumping..'+ error.message);
    }    
  },
  
}

const handleError = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}