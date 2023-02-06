
var EmailNotification = require('../../models/leafnet/emailNotification');

module.exports = {
  
  sendEmail: async function(req, res) {
    const dateId='1';
    try {
      const [Dates,targetDateErr] = await handleError(EmailNotification.getTargetDate(dateId));
      if(targetDateErr) {
           throw new Error('Could not fetch target date');  
      }
      
        const [proDataRes,proDataErr] = await handleError(EmailNotification.getSummaryData(Dates.targetDateWithTimezone));
        if(proDataErr) {
             throw new Error('error while fetching data processed data');  
        }

        const [rawDataRes,rawDataErr] = await handleError(EmailNotification.getSummaryDataMysql(Dates.targetDateWithTimezone));
        if(rawDataErr) {
             throw new Error('error while fetching raw data');  
        }
        
        const [createTableRes,createTableErr] = await handleError(EmailNotification.createTable(rawDataRes, proDataRes));
        if(createTableErr) {
             throw new Error('error while creating table');  
        }

        const [sendEmailRes,sendEmailErr] = await handleError(EmailNotification.sendEmail(createTableRes));
        if(sendEmailErr) {
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