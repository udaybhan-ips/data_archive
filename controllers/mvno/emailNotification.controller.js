var EmailNotification = require('../../models/sonus_outbound/emailNotification');

module.exports = {
  
  sendEmail: async function(req, res) {
    const dateId='2';
    try {
      const [Dates,targetDateErr] = await handleError(EmailNotification.getTargetDate(dateId));
      if(targetDateErr) {
           throw new Error('Could not fetch target date');  
      }

        const getAllTrunkgroupRes = await EmailNotification.getAllTrunkgroup();
      
        const [proDataRes,proDataErr] = await handleError(EmailNotification.getSummaryData(Dates.targetDateWithTimezone));

       // console.log("process data= "+JSON.stringify(proDataRes));

        if(proDataErr) {
             throw new Error('error while fetching data processed data');  
        }
        let rawDataRes;
        
        let html='<div>Hi</div>';

        try{
          for(let i=0; i<getAllTrunkgroupRes.length; i++){
            
            const customerId = getAllTrunkgroupRes[i].customer_id;
            const customer_name = getAllTrunkgroupRes[i].customer_name; 
            const incallednumber = getAllTrunkgroupRes[i].incallednumber; 
            rawDataRes = await EmailNotification.getSummaryDataMysql(Dates.targetDateWithTimezone, getAllTrunkgroupRes[i]); 
            let proData=[];

            for(let j=0; j< proDataRes.length; j++){
             
              let obj={}
              
              if(customer_name==proDataRes[j]['billing_comp_name']){
                obj['total'] = proDataRes[j]['total'];
                obj['duration'] = proDataRes[j]['duration'];
                obj['day'] = proDataRes[j]['day'];
                obj['billing_comp_name'] = proDataRes[j]['billing_comp_name'];
                obj['billing_comp_code'] = proDataRes[j]['billing_comp_code'];
                proData.push(obj);
              }              
            }

            html = html + await EmailNotification.createTable(rawDataRes, proData, customer_name, customerId, incallednumber);
            
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