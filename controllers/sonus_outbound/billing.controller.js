var BillingSonusOutbound = require('../../models/sonus_outbound/billing');
const dateId=2;
let detailsData = false;
module.exports = {
  getData: async function(req, res) {
    try {

        const [Dates,targetDateErr] = await handleError(BillingSonusOutbound.getTargetDate(dateId));
        if(targetDateErr) {
          throw new Error('Could not fetch target date');  
        } 
        
        const billingYear = new Date(Dates.target_billing_month).getFullYear();
        let billingMonth = new Date(Dates.target_billing_month).getMonth() + 1;

        if(parseInt(billingMonth,10)<10){ 
          billingMonth='0'+ billingMonth;
        }

        const [customerListRes,customerListErr] = await handleError(BillingSonusOutbound.getAllSonusOutboundCustomer('00000784'));
        if(customerListErr) {
          throw new Error('Could not fetch customer list');  
        }

        for(let i=0; i<customerListRes.length;i++){

          detailsData = customerListRes[i]['details_invoice'] ; 
          // For details invoice creation
          if(detailsData){
            const [deleteDetailsRes, deleteDetailsErr] = await handleError(BillingSonusOutbound.deleteDetailData(customerListRes[i]['customer_id'], billingYear, billingMonth));
            if(deleteDetailsErr) {
              throw new Error('Error while delete Details data '+ deleteDetailsErr);  
            } 
  
            const [createDetailsRes, createDetailsErr] = await handleError(BillingSonusOutbound.createDetailData(customerListRes[i]['customer_id'], billingYear, billingMonth, customerListRes[i]['landline_rate'], customerListRes[i]['mobile_rate']));
            if(createDetailsErr) {
              throw new Error('Error while creating Details data '+ createDetailsErr);  
            }
          }

          
          const [deleteSummaryRes, deleteSummaryErr] = await handleError(BillingSonusOutbound.deleteSummaryData(customerListRes[i]['customer_id'], billingYear, billingMonth));
          if(deleteSummaryErr) {
            throw new Error('Error while delete summary data '+ deleteSummaryErr);  
          } 

          const [createSummaryRes, createSummaryErr] = await handleError(BillingSonusOutbound.createSummaryData(customerListRes[i]['customer_id'], billingYear, billingMonth, customerListRes[i]['landline_rate'], customerListRes[i]['mobile_rate']));
          if(createSummaryErr) {
            throw new Error('Error while creating summary data '+ createSummaryErr);  
          }
        
        }

        // const [sendNotificationRes, sendNotificationErr] = await handleError(BillingSonusOutbound.sendNotification( billingYear, billingMonth));

        // if(sendNotificationErr) {
        //     throw new Error('Error while sending motification '+ sendNotificationErr.message);  
        // }

        console.log("done!!")
         
        
        // return {
        //     message: 'success! data inserted sucessfully',
        //     id: addRatesRes
        //   };
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