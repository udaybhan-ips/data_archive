var ArchiveLeafnet = require('../../models/leafnet/archive');
const dateId='1';
module.exports = {
  getData: async function(req, res) {
    try {
      
        const [Dates,targetDateErr] = await handleError(ArchiveLeafnet.getTargetDate(dateId));
        if(targetDateErr) {
             throw new Error('Could not fetch target date');  
        }
        console.log(JSON.stringify(Dates));

        const deleteTargetDateData = await ArchiveLeafnet.deleteTargetDateCDR(Dates.targetDate);
        
        const getTargetCDRRes = await ArchiveLeafnet.getTargetCDR(Dates.targetDateWithTimezone);

       // console.log(JSON.stringify(getTargetCDRRes));
        
       const getDataRes = await ArchiveLeafnet.insertByBatches(getTargetCDRRes);
        
        const [updateBatchControlRes, updateBatchControlErr] = await handleError(ArchiveLeafnet.updateBatchControl(dateId,Dates.targetDate));
        if(updateBatchControlErr) {
          throw new Error('Err: while updating target date');  
        }

        return res.status(200).json({
            message: 'success! data inserted sucessfully',
            
          });
    } catch (error) {
        return error;
    }    
  },
  async getArchiveStatus(req, res){
    try {
      const [archiveRes,archiveErr] = await handleError(ArchiveLeafnet.getTargetDate(dateId));
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

        const getUpdateRes = await ArchiveLeafnet.updateBatchControl(req.body.date_id, req.body.targetDate, api=true);


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