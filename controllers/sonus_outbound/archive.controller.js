var ArchiveSonusOutbound = require('../../models/sonus_outbound/archive');
const dateId='2';
module.exports = {
  getData: async function(req, res) {

    

    try {
      
        const [Dates,targetDateErr] = await handleError( ArchiveSonusOutbound.getTargetDate(dateId));
        if(targetDateErr) {
             throw new Error('Could not fetch target date');  
        }
       // console.log(JSON.stringify(Dates));

        // const deleteTargetDateData = await  ArchiveSonusOutbound.deleteTargetDateCDR(Dates.targetDate);

        const getAllTrunkgroupRes = await ArchiveSonusOutbound.getAllTrunkgroup();
        const getRatesRes = await ArchiveSonusOutbound.getRates();

        console.log(JSON.stringify(getAllTrunkgroupRes));

        let trunkPortsVal='';
        let TGsWithIncalledNum=[];
        let whereCl = [];

        try{
          for (let i=0;i<getAllTrunkgroupRes.length;i++){
            if(getAllTrunkgroupRes[i]['incallednumber']){
              TGsWithIncalledNum.push(getAllTrunkgroupRes[i]);
              
            }else{
              let trunkPorts = getAllTrunkgroupRes[i].trunk_port;
              let trunkPortsArr = trunkPorts.split(",");
  
              for(let j=0; j<trunkPortsArr.length;j++){
                trunkPortsVal = trunkPortsVal + `'${trunkPortsArr[j]}',`;
              }
            }
  
          }
          //remove last value (,)
              if(trunkPortsVal.substr(trunkPortsVal.length - 1)==','){
                trunkPortsVal = trunkPortsVal.substring(0, trunkPortsVal.length - 1);
              }

        }catch(e){
          console.log("e="+e.message);
        }
        
        
         let getTargetCDRTGRes = await  ArchiveSonusOutbound.getTargetCDR(Dates.targetDateWithTimezone, getAllTrunkgroupRes,trunkPortsVal );
         const getTGDataRes = await  ArchiveSonusOutbound.insertByBatches(getTargetCDRTGRes, getAllTrunkgroupRes, getRatesRes);
      
        // For incallednumber 

        // let getTargetCDRWithIncalledRes = await  ArchiveSonusOutbound.getTargetCDR(Dates.targetDateWithTimezone, TGsWithIncalledNum,null,"incallednumber" );
        
        // const getWithCalledDataRes = await  ArchiveSonusOutbound.insertByBatches(getTargetCDRWithIncalledRes, TGsWithIncalledNum, getRatesRes);
        
       

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

  

  async reprocessByCustomerId(req, res){
    try {
      if(req.body.customerId && req.body.customerName){

        const Dates = await ArchiveSonusOutbound.getTargetDate(dateId);
        const deleteTargetDateData = await  ArchiveSonusOutbound.deleteTargetDateCDR(Dates.targetDate, req.body.customerId, req.body.customerName );

        const getAllTrunkgroupRes = await ArchiveSonusOutbound.getAllTrunkgroup(req.body.customerId, req.body.customerName);
        const getRatesRes = await ArchiveSonusOutbound.getRates(req.body.customerId, req.body.customerName);

      //  console.log(JSON.stringify(getAllTrunkgroupRes));

        let getTargetCDRRes = await  ArchiveSonusOutbound.getTargetCDRBYID(Dates.targetDateWithTimezone, getAllTrunkgroupRes[0]);
        const getDataRes = await  ArchiveSonusOutbound.insertByBatches(getTargetCDRRes, getAllTrunkgroupRes, getRatesRes);
        const [udpateBatchControlRes, updateBatchControlErr] = await handleError( ArchiveSonusOutbound.updateBatchControl(dateId,Dates.targetDate));
        
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

  async getArchiveStatus(req, res){
    try {
      const [archiveRes,archiveErr] = await handleError(ArchiveSonusOutbound.getTargetDate(dateId));
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
  async getSonusCustomerList(req, res){
    try {
        const getSonusCustListRes = await ArchiveSonusOutbound.getSonusCustomerList();
        return res.status(200).json(getSonusCustListRes);
      
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }    
  },

  async updateArchiveDate(req, res){
    try {
      if(req.body.date_id && req.body.targetDate){

        const getUpdateRes = await ArchiveSonusOutbound.updateBatchControl(req.body.date_id, req.body.targetDate, api=true);


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