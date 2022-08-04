var AddiKotehiInfoByokakin = require('../../../models/byokakin/addi_kotehi_info/addiKotehiData');

module.exports = {
  getAddiKotehiInfo: async function(req, res) {
    
    try {
        const [freeNumListRes,freeNumListErr] = await handleError(AddiKotehiInfoByokakin.getAddiKotehiInfo(req.body));
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

  updateAddiKotehiInfo: async function(req, res) {
    
    try {
        const [freeNumListRes,freeNumListErr] = await handleError(AddiKotehiInfoByokakin.updateAddiKotehiInfo(req.body));
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
  addAddiKotehiInfo: async function(req, res) {
    
    try {
        const [freeNumListRes,freeNumListErr] = await handleError(AddiKotehiInfoByokakin.addAddiKotehiInfo(req.body));
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