var SummaryAmeyoLicense = require('../../models/ameyo_license/summary');

module.exports = {

  

  getAmeyoProcessedData: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(SummaryAmeyoLicense.getAmeyoProcessedData(req.body));
        if(summaryErr) {
             throw new Error('Could not fetch the summary');  
        }
        return res.status(200).json(summaryRes);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  getALLAmeyoData: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(SummaryAmeyoLicense.getALLAmeyoData());
        if(summaryErr) {
             throw new Error('Could not fetch the summary');  
        }
        return res.status(200).json(summaryRes);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  
  getALLAmeyoProductData: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(SummaryAmeyoLicense.getALLAmeyoProductData());
        if(summaryErr) {
             throw new Error('Could not fetch the summary');  
        }
        return res.status(200).json(summaryRes);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  addAmeyoProductItemData: async function(req, res) {    
    try {
        const [addRecordRes,addRecordErr] = await handleError(SummaryAmeyoLicense.addAmeyoProductItemData(req.body));
        if(addRecordErr) {
             throw new Error('Could not add record');  
        }
        return res.status(200).json(addRecordRes);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  

  getApprovalStatusData: async function(req, res) {    
    try {
        const [getApprovalStatusRes,getApprovalStatusErr] = await handleError(SummaryAmeyoLicense.getApprovalStatusData(req.body));
        if(getApprovalStatusErr) {
             throw new Error(getApprovalStatusErr);  
        }
        return res.status(200).json(getApprovalStatusRes);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  addApprovalStatusData: async function(req, res) {    
    try {
        const [addApprovalStatusRes,addApprovalStatusErr] = await handleError(SummaryAmeyoLicense.addApprovalStatusData(req.body));
        if(addApprovalStatusErr) {
             throw new Error(addApprovalStatusErr);  
        }
        return res.status(200).json(addApprovalStatusRes);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

 updateAmeyoProductItemData: async function(req, res) {
    try {
        const [updateRecordRes,updateRecordErr] = await handleError(SummaryAmeyoLicense.updateAmeyoProductItemData(req.body));
        if(updateRecordErr) {
             throw new Error('Could not update record');  
        }
        return res.status(200).json(updateRecordRes);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  

  getSummary: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(SummaryAmeyoLicense.getSummary());
        if(summaryErr) {
             throw new Error('Could not fetch the summary');  
        }
        return res.status(200).json(summaryRes);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  getSummaryByMonth: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(SummaryAmeyoLicense.getSummaryByMonth(req.body));
        if(summaryErr) {
             throw new Error('Could not fetch the summary');  
        }
        return res.status(200).json(summaryRes);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  getDetailsDataByMonth: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(SummaryAmeyoLicense.getDetailsDataByMonth(req.body));
        if(summaryErr) {
             throw new Error('Could not fetch the summary');  
        }
        return res.status(200).json(summaryRes);
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