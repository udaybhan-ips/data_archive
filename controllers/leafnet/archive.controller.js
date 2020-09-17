var ArchiveLeafnet = require('../../models/leafnet/archive');

module.exports = {
  getData: async function(req, res) {

    const dateId='1';

    try {
      
        const [Dates,targetDateErr] = await handleError(ArchiveLeafnet.getTargetDate(dateId));
        if(targetDateErr) {
             throw new Error('Could not fetch target date');  
        }

        const deleteTargetDateData = await ArchiveLeafnet.deleteTargetDateCDR(Dates.targetDate);
        
        const getTargetCDRRes = await ArchiveLeafnet.getTargetCDR(Dates.targetDate);
        
        const getDataRes = await ArchiveLeafnet.create(getTargetCDRRes);
        
        const [udpateBatchControlRes, updateBatchControlErr] = await handleError(ArchiveLeafnet.updateBatchControl(dateId,Dates.targetDate));
        if(updateBatchControlErr) {
          throw new Error('Err: while updating target date');  
        }

        return udpateBatchControlRes.status(200).json({
            message: 'success! data inserted sucessfully',
            id: addRatesRes
          });
    } catch (error) {
        return res.status(400).json({
            message: error
          });
    }    
  },
}



const handleError = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}