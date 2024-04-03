var SummaryAmeyoLicense = require('../../models/ameyo_license/summary');

module.exports = {

  
  getALLAmeyoData: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(SummaryAmeyoLicense.getALLAmeyoData());
        if(summaryErr) {
             throw new Error('Could not fetch the summary');  
        }
        return res.status(200).json(summaryRes);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },

  getSummary: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(SummaryAmeyoLicense.getSummary());
        if(summaryErr) {
             throw new Error('Could not fetch the summary');  
        }
        return res.status(200).json(summaryRes);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  getSummaryByMonth: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(SummaryAmeyoLicense.getSummaryByMonth(req.body));
        if(summaryErr) {
             throw new Error('Could not fetch the summary');  
        }
        return res.status(200).json(summaryRes);
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  getDetailsDataByMonth: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(SummaryAmeyoLicense.getDetailsDataByMonth(req.body));
        if(summaryErr) {
             throw new Error('Could not fetch the summary');  
        }
        return res.status(200).json(summaryRes);
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