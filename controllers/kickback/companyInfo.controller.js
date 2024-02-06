var CompanyInfo = require('../../models/kickback/manage_kick_comp');

module.exports = {


  getKICKBACKConfigEmailInfo: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(CompanyInfo.getKICKBACKConfigEmailInfo());
        if(summaryErr) {
             //throw new Error('Could not fetch the summary');
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
  updateKICKBACKConfigEmailInfo: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(CompanyInfo.updateKICKBACKConfigEmailInfo(req.body));
        if(summaryErr) {
             //throw new Error('Could not fetch the summary');
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
  addKICKBACKConfigEmailInfo: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(CompanyInfo.addKICKBACKConfigEmailInfo(req.body));
        if(summaryErr) {
             //throw new Error('Could not fetch the summary');
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


  getCompanyInfo: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(CompanyInfo.getKICKCompanyInfo());
        if(summaryErr) {
             //throw new Error('Could not fetch the summary');
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
  updateCompany: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(CompanyInfo.updateCompany(req.body));
        if(summaryErr) {
             //throw new Error('Could not fetch the summary');
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
  addCompany: async function(req, res) {
    try {
        const [summaryRes,summaryErr] = await handleError(CompanyInfo.addCompanyInfo(req.body));
        if(summaryErr) {
             //throw new Error('Could not fetch the summary');
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