var SummaySonusOutbound = require('../../models/sonus_outbound/summary');

module.exports = {
  getSummary: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(SummaySonusOutbound.getSummary());
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
        const [summaryRes,summaryErr] = await handleError(SummaySonusOutbound.getSummaryByMonth(req.body));
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
        const [summaryRes,summaryErr] = await handleError(SummaySonusOutbound.getDetailsDataByMonth(req.body));
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