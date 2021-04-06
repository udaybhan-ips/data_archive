var BillingLeafnet = require('../../models/sonus_outbound/billing');

module.exports = {
  getData: async function(req, res) {
    try {
        const [ratesDetails,ratesErr] = await handleError(BillingLeafnet.updateSummaryData());
        if(ratesErr) {
             throw new Error('issue with summary data');  
        }
    
        
        return {
            message: 'success! data inserted sucessfully',
            id: addRatesRes
          };
    } catch (error) {
      console.log("Error!!"+error.message);
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