var AnalysisInfo = require('../../models/data_analysis/analysis_info');

module.exports = {
  getAnalysisInfo: async function(req, res) {
    
    try {
        const [agentAnalysisInfoRes,agentAnalysisInfoErr] = await handleError(AnalysisInfo.getAnalysisInfo(req.body));
        if(agentAnalysisInfoErr) {

             return res.status(500).json({
              message: agentAnalysisInfoErr.message
            });  
        }
        return res.status(200).json(agentAnalysisInfoRes);
        
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