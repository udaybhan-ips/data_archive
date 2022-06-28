var SummaryNTT = require('../../../models/byokakin/ntt_orix/summary');

module.exports = {
  getSummary: async function(req, res) {
    
    try {
        const [summaryRes,summaryErr] = await handleError(SummaryNTT.getSummaryByMonth(req.body));
        if(summaryErr) {

             return res.status(500).json({
              message: summaryErr.message
            });  
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