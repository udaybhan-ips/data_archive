var InvoiceLeafnet = require('../../models/leafnet/invoice');

module.exports = {
  getInvoiceData: async function(req, res) {
    try {
        const [invoiceRes,invoiceError] = await handleError(InvoiceLeafnet.getInvoiceData());
        if(invoiceError) {
             throw new Error('Could not fetch the invoice');  
        }
        return invoiceRes;
        
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