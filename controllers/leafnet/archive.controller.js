var ArchiveLeafnet = require('../../models/leafnet/archive');

module.exports = {
  getData: async function(req, res) {

    const dateId='1';

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
        
        const [udpateBatchControlRes, updateBatchControlErr] = await handleError(ArchiveLeafnet.updateBatchControl(dateId,Dates.targetDate));
        if(updateBatchControlErr) {
          throw new Error('Err: while updating target date');  
        }

        return udpateBatchControlRes.status(200).json({
            message: 'success! data inserted sucessfully',
            id: addRatesRes
          });
    } catch (error) {
        return error;
    }    
  },
}



const handleError = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}