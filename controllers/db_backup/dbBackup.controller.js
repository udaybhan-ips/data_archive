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

  cdrSonusBackup: async function(req, res) {
    const dateId = 3;
    const DBName = "sonus_db"
    try {

      const [Dates, targetDateErr] = await handleError(DBBACKUP.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }
      // console.log(JSON.stringify(Dates));

      const [tableName, tableNameErr] = await handleError(DBBACKUP.getTableName(Dates.targetDate));
      if (tableNameErr) {
        throw new Error('Could not fetch table name');
      }
        const [startDBbackupDailyRes,startDBbackupDailyErr] = await handleError(DBBACKUP.cdrSonusDBbackupDaily(DBName, tableName));
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