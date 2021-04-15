var BillingLeafnet = require('../../models/leafnet/billing');
const dateId=1;
const customerId='00000594';
module.exports = {
  getData: async function(req, res) {
    try {
        const [ratesDetails,ratesErr] = await handleError(BillingLeafnet.getRates());
        if(ratesErr) {
             throw new Error('Could not fetch Rates details');  
        }

        const [Dates,targetDateErr] = await handleError(BillingLeafnet.getTargetDate(dateId));
        if(targetDateErr) {
           throw new Error('Could not fetch target date');  
        } 
        
        const billingYear = new Date(Dates.target_billing_month).getFullYear();
        
        let billingMonth = new Date(Dates.target_billing_month).getMonth() + 1;
        if(parseInt(billingMonth,10)<10){
           billingMonth='0'+billingMonth;
        }
  
        const [getCDRRes, getCDRResErr] = await handleError( BillingLeafnet.getTargetCDR(billingYear, billingMonth));
        if(getCDRResErr) {
            throw new Error('Could not fetch CDRes ');  
        }
    
        const [billing, billingErr] = await handleError(BillingLeafnet.insertByBatches(getCDRRes, ratesDetails));
        if(billingErr) {
            throw new Error('Error while billing '+ billingErr);  
        }

        const [deleteSummaryRes, deleteSummaryErr] = await handleError(BillingLeafnet.deleteSummaryData(customerId, billingYear, billingMonth));
        if(deleteSummaryErr) {
            throw new Error('Error while delete summary data '+ deleteSummaryErr);  
        }

        const [createSummaryRes, createSummaryErr] = await handleError(BillingLeafnet.createSummaryData(customerId,billingYear, billingMonth));
        if(createSummaryErr) {
            throw new Error('Error while creating summary data '+ createSummaryErr);  
        }
        
        const [createInvoiceRes, createInvoiceErr] = await handleError(BillingLeafnet.genrateInvoice(customerId, billingYear, billingMonth,Dates.current_montth));

        if(createInvoiceErr) {
            throw new Error('Error while creating invoice '+ createInvoiceErr.message);  
        }
        
        return {
            message: 'success! data inserted sucessfully',
            id: createInvoiceRes
          };
    } catch (error) {

      console.log("Error !!!"+error.message);
      return {
          message: error
      };
    }    
  },

  createInvoiceFile: async function(req, res){

    try{
      
      const [createInvoiceRes, createInvoiceErr]=await BillingLeafnet.genrateInvoice();

        if(createInvoiceErr) {
            throw new Error('Error while billing '+ createInvoiceErr.message);  
        }
        
        console.log({message: 'success!'});
    }catch(err){
      console.log("Error !!="+ err.message);
    }


  },
  
}




const handleError = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}