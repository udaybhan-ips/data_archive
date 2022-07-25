var NumberListByokakin = require('../../../models/byokakin/free_dial/numberList');

module.exports = {
  getFreeDialNumberList: async function(req, res) {
    
    try {
        const [freeNumListRes,freeNumListErr] = await handleError(NumberListByokakin.getFreeDialNumberList(req.body));
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

  updateFreeDialNumberList: async function(req, res) {
    
    try {
        const [freeNumListRes,freeNumListErr] = await handleError(NumberListByokakin.updateFreeDialNumberList(req.body));
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
  addFreeDialNumberList: async function(req, res) {
    
    try {
        const [freeNumListRes,freeNumListErr] = await handleError(NumberListByokakin.addFreeDialNumberList(req.body));
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