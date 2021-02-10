var CDRSonusOutbound = require('../../models/sonus_outbound/cdr');

module.exports = {
  getCDRPath: async function(req, res) {
    try {
        const [cdrRes,cdrError] = await handleError(CDRSonusOutbound.getCDRPath());
        if(cdrError) {
             throw new Error('Could not fetch the cdr path');  
        }
        return cdrRes;
        
    } catch (error) {
        return {
            message: error
          };
    }    
  },
}

const handleError = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}