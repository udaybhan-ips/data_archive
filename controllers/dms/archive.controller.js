var ArchiveDMS = require('../../models/dms/archive');
const dateId='10';
module.exports = {
  getData: async function(req, res) {
    try {
      
        const [Dates,targetDateErr] = await handleError(ArchiveDMS.getTargetDate(dateId));
        if(targetDateErr) {
             throw new Error('Could not fetch target date');  
        }
        console.log(JSON.stringify(Dates));
        const [getTableNameRes, getTableNameErr] = await handleError(ArchiveDMS.getTableName(Dates.targetDate));

        if(getTableNameErr){
          throw new Error("Error while getting table name!!!"+getTableNameErr.message);          
        }
        const checkTableExistRes = await ArchiveDMS.checkTableExist(getTableNameRes);
        const targetDay = new Date(Dates.targetDate).getDate();
    
        if(!checkTableExistRes){
          if(targetDay == 1){
            // create table here
            const checkTableExistRes = await ArchiveDMS.createTable(getTableNameRes);
          }else{
            //send email there is issue
            const sendErrorEmail = await ArchiveDMS.sendErrorEmail(getTableNameRes, Dates.targetDate);
            return("Please check the batch control table and table name..! Table must be created!")
          }
        }
        const deleteTargetDateData = await ArchiveDMS.deleteTargetDateCDR(Dates.targetDate, getTableNameRes);
        const getDIDsRes = await ArchiveDMS.getDIDs(Dates.targetDateWithTimezone);
        const getTargetCDRRes = await ArchiveDMS.getTargetCDR(Dates.targetDateWithTimezone, getDIDsRes);
        const getDataRes = await ArchiveDMS.insertByBatches(getTableNameRes, getTargetCDRRes);

       // console.log(JSON.stringify(getTargetCDRRes));        
        const [updateBatchControlRes, updateBatchControlErr] = await handleError(ArchiveDMS.updateBatchControl(dateId, Dates.targetDate));
        if(updateBatchControlErr) {
          throw new Error('Err: while updating target date');  
        }

        
    } catch (error) {
      throw new Error("Error in archiving !"+error.message)        
    }    
  },
  async getArchiveStatus(req, res){
    try {
      const [archiveRes,archiveErr] = await handleError(ArchiveDMS.getTargetDate(dateId));
      if(archiveErr) {
           //throw new Error('Could not fetch the summary');
           return res.status(500).json({
            message: archiveErr.message
          });  
      }
      return res.status(200).json([archiveRes]);
      
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }    
  },


  async updateArchiveDate(req, res){
    try {
      if(req.body.date_id && req.body.targetDate){

        const getUpdateRes = await ArchiveDMS.updateBatchControl(req.body.date_id, req.body.targetDate, api=true);
        return res.status(200).json([{id:0,result:'success',message:'done'}]);
      }else{
        return res.status(400).json({result:'fail',message:'process date missing'});
      }      
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }    
  },
  
}



const handleError = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}