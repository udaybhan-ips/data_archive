var CDRSonusOutbound = require('../../models/sonus_outbound/cdr');
let dateId=2
module.exports = {

  getCDRPath: async function(req, res) {
    return { message: 'data',
            id: ''
      }
  },

  createCDR: async function(req, res) {

  try{
    const [Dates,targetDateErr] = await handleError(CDRSonusOutbound.getTargetDate(dateId));
    if(targetDateErr) {
      throw new Error('Could not fetch target date');  
    } 
    
    const billingYear = new Date(Dates.target_billing_month).getFullYear();
    let billingMonth = new Date(Dates.target_billing_month).getMonth() + 1;

    if(parseInt(billingMonth,10)<10){
      billingMonth='0'+billingMonth;
    }

    const [customerListRes,customerListErr] = await handleError(CDRSonusOutbound.getAllSonusOutboundCustomer(dateId));
    if(customerListErr) {
      throw new Error('Could not fetch customer list');  
    }

    console.log("customer list=="+JSON.stringify(customerListRes));

    for(let i=0; i<customerListRes.length;i++){
      
      const [createSummaryRes, createSummaryErr] = await handleError(CDRSonusOutbound.createCDR(customerListRes[i]['customer_name'], customerListRes[i]['customer_id'], billingYear, billingMonth));
      if(createSummaryErr) {
        throw new Error('Error while creating summary data '+ createSummaryErr);  
      }
    
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