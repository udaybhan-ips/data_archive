var DMSService = require('../../models/dms/dms_services');
const dateId='10';
module.exports = {

  

  async updateDMSRate(req, res){
    try {
      const [updateDMSRateRes,updateDMSRateErr] = await handleError(DMSService.updateDMSRate(req.body));
      if(updateDMSRateErr) {
           //throw new Error('Could not fetch the summary');
           return res.status(500).json({
            message: updateDMSRateErr.message
          });  
      }
      return res.status(200).json(updateDMSRateRes);
      
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }    
  },

  async getDMSRateDetails(req, res){
    try {
      const [getDMSRateDetailsRes,getDMSRateDetailsErr] = await handleError(DMSService.getDMSRateDetails(req.body));
      if(getDMSRateDetailsErr) {
           //throw new Error('Could not fetch the summary');
           return res.status(500).json({
            message: getDMSRateDetailsErr.message
          });  
      }
      return res.status(200).json(getDMSRateDetailsRes);
      
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }    
  },

  async deleteDMSDetailsData(req, res){
    try {
      const [deleteDMSDetailsDataRes,deleteDMSDetailsDataErr] = await handleError(DMSService.deleteDMSDetailsData(req.body));
      if(deleteDMSDetailsDataErr) {
           //throw new Error('Could not fetch the summary');
           return res.status(500).json({
            message: deleteDMSDetailsDataErr.message
          });  
      }
      return res.status(200).json(deleteDMSDetailsDataRes);
      
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }    
  },

 
  async createDMSBillingData(req, res){
    try {
      const [createDMSBillingDataRes,createDMSBillingDataErr] = await handleError(DMSService.createDMSBillingData(req.body));
      if(createDMSBillingDataErr) {
           //throw new Error('Could not fetch the summary');
           return res.status(500).json({
            message: createDMSBillingDataErr.message
          });  
      }
      return res.status(200).json([createDMSBillingDataRes]);
      
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }    
  },

  async getDMSSummaryData(req, res){
    try {
      const [getDMSSummaryDataRes,getDMSSummaryDataErr] = await handleError(DMSService.getDMSSummaryData(req.body));
      if(getDMSSummaryDataErr) {
           //throw new Error('Could not fetch the summary');
           return res.status(500).json({
            message: getDMSSummaryDataErr.message
          });  
      }
      return res.status(200).json(getDMSSummaryDataRes);
      
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }    
  },

  async getDMSDetailsData(req, res){
    try {
      const [getDMSDetailsDataRes,getDMSDetailsDataErr] = await handleError(DMSService.getDMSDetailsData(req.body));
      if(getDMSDetailsDataErr) {
           //throw new Error('Could not fetch the summary');
           return res.status(500).json({
            message: getDMSDetailsDataErr.message
          });  
      }
      return res.status(200).json(getDMSDetailsDataRes);
      
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }    
  },

  

  async updateArchiveDate(req, res){
    try {
      if(req.body.date_id && req.body.targetDate){

        const getUpdateRes = await DMSService.updateBatchControl(req.body.date_id, req.body.targetDate, api=true);
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