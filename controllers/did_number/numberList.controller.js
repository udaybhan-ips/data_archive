var NumberList = require('../../models/did_number/numberList');

module.exports = {
  getDIDNumberList: async function(req, res) {
    
    try {
        const [didNumberListRes,didNumberListErr] = await handleError(NumberList.getDIDNumberList(req.body));
        if(didNumberListErr) {

             return res.status(500).json({
              message: didNumberListErr.message
            });  
        }
        return res.status(200).json(didNumberListRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  updateDIDNumberList: async function(req, res) {
    
    try {
        const [didNumberListRes,didNumberListErr] = await handleError(NumberList.updateDIDNumberList(req.body));
        if(didNumberListErr) {

             return res.status(500).json({
              message: didNumberListErr.message
            });  
        }
        return res.status(200).json(didNumberListRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  addDIDNumberList: async function(req, res) {
    
    try {
        const [didNumberListRes,didNumberListErr] = await handleError(NumberList.addDIDNumberList(req.body));
        if(didNumberListErr) {
             return res.status(500).json({
              message: didNumberListErr.message
            });  
        }
        return res.status(200).json(didNumberListRes);
        
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