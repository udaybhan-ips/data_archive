var AccountInfoByokakin = require('../../../models/byokakin/account_info/accountData');

module.exports = {
  getAccountInfo: async function(req, res) {
    
    try {
        const [accountIdListRes,accountIdListErr] = await handleError(AccountInfoByokakin.getAccountInfo(req.body));
        if(accountIdListErr) {

             return res.status(500).json({
              message: accountIdListErr.message
            });  
        }
        return res.status(200).json(accountIdListRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  updateAccountInfo: async function(req, res) {
    
    try {
        const [accountIdListRes,accountIdListErr] = await handleError(AccountInfoByokakin.updateAccountInfo(req.body));
        if(accountIdListErr) {

             return res.status(500).json({
              message: accountIdListErr.message
            });  
        }
        return res.status(200).json(accountIdListRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  addAccountInfo: async function(req, res) {
    
    try {
        const [accountIdListRes,accountIdListErr] = await handleError(AccountInfoByokakin.addAccountInfo(req.body));
        if(accountIdListErr) {
             return res.status(500).json({
              message: accountIdListErr.message
            });  
        }
        return res.status(200).json(accountIdListRes);
        
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