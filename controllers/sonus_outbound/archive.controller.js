var ArchiveSonusOutbound = require('../../models/sonus_outbound/archive');

module.exports = {
  getData: async function(req, res) {

    const dateId='2';

    try {
      
        const [Dates,targetDateErr] = await handleError( ArchiveSonusOutbound.getTargetDate(dateId));
        if(targetDateErr) {
             throw new Error('Could not fetch target date');  
        }
       // console.log(JSON.stringify(Dates));

        const deleteTargetDateData = await  ArchiveSonusOutbound.deleteTargetDateCDR(Dates.targetDate);

        const getAllTrunkgroupRes = await ArchiveSonusOutbound.getAllTrunkgroup();
        const getRatesRes = await ArchiveSonusOutbound.getRates();

      //  console.log(JSON.stringify(getAllTrunkgroupRes));

        for (let i=0;i<getAllTrunkgroupRes.length;i++){
            let getTargetCDRRes = await  ArchiveSonusOutbound.getTargetCDR(Dates.targetDateWithTimezone, getAllTrunkgroupRes[i]);
            const getDataRes = await  ArchiveSonusOutbound.insertByBatches(getTargetCDRRes, getAllTrunkgroupRes[i], getRatesRes);
        
        }

        const [udpateBatchControlRes, updateBatchControlErr] = await handleError( ArchiveSonusOutbound.updateBatchControl(dateId,Dates.targetDate));
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