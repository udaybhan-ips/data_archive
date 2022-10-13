var CommissionInfo = require('../../models/commission/commission');

module.exports = {
  getCommissionInfo: async function(req, res) {
    
    try {
        const [agentCommissionInfoRes,agentCommissionInfoErr] = await handleError(CommissionInfo.getCommissionInfo(req.body));
        if(agentCommissionInfoErr) {

             return res.status(500).json({
              message: agentCommissionInfoErr.message
            });  
        }
        return res.status(200).json(agentCommissionInfoRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  createCommissionDetails: async function(req, res) {
    
    try {
        const [createCommissionDetailsRes,createCommissionDetailsErr] = await handleError(CommissionInfo.createCommissionDetails(req.body));
        if(createCommissionDetailsErr) {

             return res.status(500).json({
              message: createCommissionDetailsErr.message
            });  
        }
        return res.status(200).json(createCommissionDetailsRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  getCommissionDetails: async function(req, res) {
    
    try {

      console.log("req.."+ JSON.stringify(req.body))
        const [getCommissionDetailsRes,getCommissionDetailsErr] = await handleError(CommissionInfo.getCommissionDetails(req.body));
        if(getCommissionDetailsErr) {

             return res.status(500).json({
              message: getCommissionDetailsErr.message
            });  
        }
        return res.status(200).json(getCommissionDetailsRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  getCommissionSummary: async function(req, res) {
    
    try {
        const [getCommissionSummaryRes,getCommissionSummaryErr] = await handleError(CommissionInfo.getCommissionSummary(req.body));
        if(getCommissionSummaryErr) {

             return res.status(500).json({
              message: getCommissionSummaryErr.message
            });  
        }
        return res.status(200).json(getCommissionSummaryRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  deleteCommissionInfo: async function(req, res) {
    
    try {
        const [deleteCommissionSummaryRes,deleteCommissionSummaryErr] = await handleError(CommissionInfo.deleteCommissionSummary(req.body));
        if(deleteCommissionSummaryErr) {

             return res.status(500).json({
              message: deleteCommissionSummaryErr.message
            });  
        }
        return res.status(200).json(deleteCommissionSummaryRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  

  updateAddiKotehiInfo: async function(req, res) {
    
    try {
        const [freeNumListRes,freeNumListErr] = await handleError(CommissionInfo.updateAddiKotehiInfo(req.body));
        if(freeNumListErr) {

             return res.status(500).json({
              message: freeNumListErr.message
            });  
        }
        return res.status(200).json(freeNumListRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  addCommissionInfo: async function(req, res) {
    
    try {
        const [freeNumListRes,freeNumListErr] = await handleError(CommissionInfo.addCommissionInfo(req.body));
        if(freeNumListErr) {
             return res.status(500).json({
              message: freeNumListErr.message
            });  
        }
        return res.status(200).json(freeNumListRes);
        
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