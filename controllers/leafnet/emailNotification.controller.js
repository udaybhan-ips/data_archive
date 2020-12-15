const { createTable } = require('../../models/leafnet/emailNotification');
var EmailNotification = require('../../models/leafnet/emailNotification');

module.exports = {
  
  sendEmail: async function(req, res) {
    const dateId='1';
    try {
      const [Dates,targetDateErr] = await handleError(EmailNotification.getTargetDate(dateId));
      if(targetDateErr) {
           throw new Error('Could not fetch target date');  
      }
      
        const [proDataRes,proDataErr] = await handleError(EmailNotification.getSummaryData(Dates.targetDate));
        if(proDataErr) {
             throw new Error('error while fetching data processed data');  
        }

        const [rawDataRes,rawDataErr] = await handleError(EmailNotification.getSummaryDataMysql(Dates.targetDateWithTimezone));
        if(rawDataErr) {
             throw new Error('error while fetching data raw data');  
        }
        
        const [createTableRes,createTableErr] = await handleError(EmailNotification.createTable(rawDataRes, proDataRes));
        if(rawDataErr) {
             throw new Error('error while creating table');  
        }

        const [sendEmailRes,sendEmailErr] = await handleError(EmailNotification.sendEmail(createTableRes));
        if(rawDataErr) {
             throw new Error('error while sending email');  
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