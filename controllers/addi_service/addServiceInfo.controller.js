var AddiServiceInfo = require('../../models/addi_services/addi_services');

module.exports = {
  getAddiServiceInfo: async function(req, res) {
    
    try {
        const [agentAddiServiceInfoRes,agentAddiServiceInfoErr] = await handleError(AddiServiceInfo.getAddiServiceInfo(req.body));
        if(agentAddiServiceInfoErr) {

             return res.status(500).json({
              message: agentAddiServiceInfoErr.message
            });  
        }
        return res.status(200).json(agentAddiServiceInfoRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  createAddiServiceDetails: async function(req, res) {
    console.log("req.."+ JSON.stringify(req.body))
    try {
        const [createAddiServiceDetailsRes,createAddiServiceDetailsErr] = await handleError(AddiServiceInfo.createAddiServiceDetails(req.body));
        if(createAddiServiceDetailsErr) {

             return res.status(500).json({
              message: createAddiServiceDetailsErr.message
            });  
        }
        return res.status(200).json(createAddiServiceDetailsRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  getAddiServiceDetails: async function(req, res) {
    
    try {

      
        const [getAddiServiceDetailsRes,getAddiServiceDetailsErr] = await handleError(AddiServiceInfo.getAddiServiceDetails(req.body));
        if(getAddiServiceDetailsErr) {

             return res.status(500).json({
              message: getAddiServiceDetailsErr.message
            });  
        }
        return res.status(200).json(getAddiServiceDetailsRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  getAddiServiceSummaryData: async function(req, res) {
    
    try {
        const [getAddiServiceSummaryRes,getAddiServiceSummaryErr] = await handleError(AddiServiceInfo.getAddiServiceSummaryData(req.body));
        if(getAddiServiceSummaryErr) {

             return res.status(500).json({
              message: getAddiServiceSummaryErr.message
            });  
        }
        return res.status(200).json(getAddiServiceSummaryRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },


  getAddiServiceDetailsData: async function(req, res) {
    
    try {
        const [getAddiServiceSummaryRes,getAddiServiceSummaryErr] = await handleError(AddiServiceInfo.getAddiServiceDetailsData(req.body));
        if(getAddiServiceSummaryErr) {

             return res.status(500).json({
              message: getAddiServiceSummaryErr.message
            });  
        }
        return res.status(200).json(getAddiServiceSummaryRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  deleteAddiServiceInfo: async function(req, res) {
    
    try {
        const [deleteAddiServiceSummaryRes,deleteAddiServiceSummaryErr] = await handleError(AddiServiceInfo.deleteAddiServiceSummary(req.body));
        if(deleteAddiServiceSummaryErr) {

             return res.status(500).json({
              message: deleteAddiServiceSummaryErr.message
            });  
        }
        return res.status(200).json(deleteAddiServiceSummaryRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  

  updateAddiServiceInfo: async function(req, res) {
    console.log("req..."+JSON.stringify(req.body))
    try {
        const [updateCommRes,updateCommErr] = await handleError(AddiServiceInfo.updateAddiServiceInfo(req.body));


        if(updateCommErr) {

             return res.status(500).json({
              message: updateCommErr.message
            });  
        }
        return res.status(200).json(updateCommRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  addAddiServiceInfo: async function(req, res) {
    
    try {
        const [addAddiServiceInfoRes,addAddiServiceInfoErr] = await handleError(AddiServiceInfo.addAddiServiceInfo(req.body));
        if(addAddiServiceInfoErr) {
             return res.status(500).json({
              message: addAddiServiceInfoErr.message
            });  
        }
        return res.status(200).json(addAddiServiceInfoRes);
        
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