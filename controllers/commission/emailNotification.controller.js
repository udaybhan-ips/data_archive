
var EmailNotification = require('../../models/commission/emailNotification');

module.exports = {
  
  sendEmail: async function(req, res) {
    const dateId='11';
    try {
      const [Dates,targetDateErr] = await handleError(EmailNotification.getTargetDate(dateId));
      if(targetDateErr) {
           throw new Error('Could not fetch target date');  
      }


      const billingYear = new Date(Dates.target_billing_month).getFullYear();
        let billingMonth = new Date(Dates.target_billing_month).getMonth() + 1;

        if(parseInt(billingMonth,10)<10){ 
          billingMonth='0'+ billingMonth;
        }

        const [customerListRes,customerListErr] = await handleError(EmailNotification.getAllCommissionCustomer('00000439'));
        if(customerListErr) {
          throw new Error('Could not fetch customer list');  
        }

        for(let i=0; i<customerListRes.length;i++){

                    
          const [getEmailDetailsRes,getEmailDetailsErr] = await handleError(EmailNotification.getEmailDetails(customerListRes[i]['customer_cd'], billingYear, '11'));
          if(getEmailDetailsErr) {
               throw new Error('error while fetching data processed data');  
          }
  
          const sendEmailRes = await EmailNotification.sendEmail(getEmailDetailsRes, customerListRes[i]['customer_cd']);
          // if(sendEmailErr) {
          //      throw new Error('error while sending email');  
          // }

          console.log("Send Email res"+JSON.stringify(sendEmailRes));
        
        }
      
      

        
       
    } catch (error) {
        return {
            message: error
          };
    }    
  },
  sendEmailByApi: async function(req, res) {
    const dateId='1';
    try {
      const [Dates,targetDateErr] = await handleError(EmailNotification.getTargetDate(dateId));
      if(targetDateErr) {
        return res.status(400).json({
          message: 'Could not fetch target date'
        });           
      }
      
        const [proDataRes,proDataErr] = await handleError(EmailNotification.getSummaryData(Dates.targetDateWithTimezone));
        if(proDataErr) {
          return res.status(400).json({
            message: 'error while fetching data processed data'
          }); 
             
        }

        const [rawDataRes,rawDataErr] = await handleError(EmailNotification.getSummaryDataMysql(Dates.targetDateWithTimezone));
        if(rawDataErr) {
          return res.status(400).json({
            message: 'error while fetching raw data'
          }); 
             
        }
        
        const [createTableRes,createTableErr] = await handleError(EmailNotification.createTable(rawDataRes, proDataRes));
        if(createTableErr) {
          return res.status(400).json({
            message: 'error while creating table'
          }); 
             
        }

        const [sendEmailRes,sendEmailErr] = await handleError(EmailNotification.sendEmail(createTableRes));
        if(sendEmailErr) {
          return res.status(400).json({
            message: 'error while sending email'
          }); 
             
        }

        return res.status(200).json({
          message: 'success! email sent'
        }); 
        
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