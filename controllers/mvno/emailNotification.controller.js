var EmailNotification = require('../../models/mvno/emailNotification');

module.exports = {
  
  sendEmail: async function(req, res) {
    const dateId='5';
    try {
      const [Dates,targetDateErr] = await handleError(EmailNotification.getTargetDate(dateId));
      if(targetDateErr) {
           throw new Error('Could not fetch target date');  
      }

        const getAllCustomerRes = await EmailNotification.getAllCustomer();
      
        

       // console.log("process data= "+JSON.stringify(proDataRes));

        
        let rawDataRes;
        
        let html='<div>Hi</div>';

        try{
          for(let i=0; i<getAllCustomerRes.length; i++){
            
            const [proDataRes,proDataErr] = await handleError(EmailNotification.getSummaryData(Dates.targetDateWithTimezone,getAllCustomerRes[i] ));
            if(proDataErr) {
              throw new Error('error while fetching data processed data');  
            }
            rawDataRes = await EmailNotification.getSummaryDataMysql(Dates.targetDateWithTimezone, getAllTrunkgroupRes[i]); 
            html = html + await EmailNotification.createTable(proDataRes, rawDataRes,getAllCustomerRes[i]);
            
          }
        }catch(error){
          console.log("Err "+ error.message);
        }
        
       // console.log(JSON.stringify(rawDataRes));
        let h1='<div>Thank you</div>';
        html= html+h1;
       await EmailNotification.sendEmail(html);
        
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