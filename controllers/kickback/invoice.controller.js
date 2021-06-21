var InvoiceLeafnet = require('../../models/leafnet/invoice');

module.exports = {
  getInvoice: async function(req, res) {
    try {
        const [invoiceRes,invoiceError] = await handleError(InvoiceLeafnet.getInvoiceData());
        if(invoiceError) {
             throw new Error('Could not fetch the invoice');  
        }
        return res.status(200).json(invoiceRes);
        
        
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