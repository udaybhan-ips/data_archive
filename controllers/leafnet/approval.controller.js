var ApprovalLeafnet = require('../../models/leafnet/approval');

module.exports = {
    getStatusByInvoiceNo: async function(req, res) {
    try {
        const [getApprovalStatusRes,getApprovalStatusError] = await handleError(ApprovalLeafnet.getStatusByInvoiceNo(req.body));
        if(getApprovalStatusError) {
            return res.status(400).json({
                message: getApprovalStatusError
              });             
        }
        return res.status(200).json(getApprovalStatusRes);
        
    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }    
  },
  addApprovalStatus: async function(req, res){
    try {
      const [addApprovalRes,addApprovalErr] = await handleError(ApprovalLeafnet.addApprovalStatus(req.body));
      if(addApprovalErr) {
        return res.status(400).json({
            message: addApprovalErr
          });    
           
      }
      let html = '<div> this is test email for leafnet approval </div>'
      if(req && req.body && req.body.status){
        if(req.body.status==='Approve'){
          ApprovalLeafnet.sendApprovalNotification(html);
        }        
      }
      

      return res.status(200).json(addApprovalRes);
      

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