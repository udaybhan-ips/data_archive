var CDRLeafnet = require('../../models/leafnet/cdr');

module.exports = {
    getCDRPath: async function(req, res) {
    try {
        const [cdrRes,cdrError] = await handleError(CDRLeafnet.getInvoiceData());
        if(cdrError) {
             throw new Error('Could not fetch the cdr path');  
        }
        return res.status(200).json(cdrRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  genrateCSV: async function(req, res){
    try {
      const [genrateCSVRes,genrateCSVErr] = await handleError(CDRLeafnet.createCDR());
      if(genrateCSVErr) {
           throw new Error('Could not fetch the cdr path');  
      }
      return cdrRes;
    } catch (error) {
      console.log("Error =="+error.message);
    }
  },
}

const handleError = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}