var ByokakinCustomerList = require('../../../models/byokakin/customer/customerList');

module.exports = {
  getByokiakinCustomerList: async function(req, res) {
    
    try {
        const [customerListRes,customerListErr] = await handleError(ByokakinCustomerList.getByokiakinCustomerList(req.body));
        if(customerListErr) {

             return res.status(500).json({
              message: customerListErr.message
            });  
        }
        return res.status(200).json(customerListRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  updateByokakinCustomer: async function(req, res) {
    
    try {
      
        const [updateByokakinRes,updateByokakinErr] = await handleError(ByokakinCustomerList.updateByokakinCustomer(req.body));
        if(updateByokakinErr) {

             return res.status(500).json({
              message: updateByokakinErr.message
            });  
        }
        return res.status(200).json(updateByokakinRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  addFreeDialNumberList: async function(req, res) {
    
    try {
        const [freeNumListRes,freeNumListErr] = await handleError(ByokakinCustomerList.addFreeDialNumberList(req.body));
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