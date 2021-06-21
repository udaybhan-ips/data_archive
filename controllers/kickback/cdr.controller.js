var CDRLeafnet = require('../../models/leafnet/cdr');
let dateId=1;

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

      const [Dates,targetDateErr] = await handleError(CDRLeafnet.getTargetDate(dateId));
      if(targetDateErr) {
          throw new Error('Could not fetch target date');  
       } 
      
      const billingYear = new Date(Dates.target_billing_month).getFullYear();
      let billingMonth = new Date(Dates.target_billing_month).getMonth() + 1;
      
      if(parseInt(billingMonth,10)<10){
          billingMonth='0'+billingMonth;
      }

      const [genrateCSVRes,genrateCSVErr] = await handleError(CDRLeafnet.createCDR(billingYear,billingMonth));
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