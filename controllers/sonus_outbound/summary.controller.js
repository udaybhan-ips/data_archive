var SummayLeafnet = require('../../models/sonus_outbound/summary');

module.exports = {
  getSummary: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(SummayLeafnet.summary());
        if(summaryErr) {
             throw new Error('Could not fetch the summary');  
        }
        
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