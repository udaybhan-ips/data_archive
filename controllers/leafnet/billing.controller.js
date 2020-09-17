var BillingLeafnet = require('../../models/leafnet/billing');

module.exports = {
  getData: async function(req, res) {
    try {
        const [ratesDetails,ratesErr] = await handleError(BillingLeafnet.getRates());
        if(ratesErr) {
             throw new Error('Could not fetch Rates details');  
        }
    
        const [getCDRRes, getCDRResErr] = await handleError( BillingLeafnet.getTargetCDR());
        if(getCDRResErr) {
            throw new Error('Could not fetch CDRes ');  
        }
    
        const [billing, billingErr] = await BillingLeafnet.create(getCDRRes, ratesDetails);
        if(billingErr) {
            throw new Error('Error while billing '+ billingErr);  
        }
        
        return {
            message: 'success! data inserted sucessfully',
            id: addRatesRes
          };
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