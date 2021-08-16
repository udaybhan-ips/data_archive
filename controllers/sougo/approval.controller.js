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

    //console.log(req.body);
    // {
    //   id: 65,
    //   customer_name: 'Leafnet',
    //   customer_id: '00000594',
    //   billing_month: '04',
    //   billing_year: '2021',
    //   billing_date: '2021-04-01 00:00:00',
    //   update_date: '2021-06-07 13:15:42.771334',
    //   duration: '343121538',
    //   landline_amt: null,
    //   mobile_amt: null,
    //   total_amt: '18599772',
    //   invoice_no: '00000594-202104-1',
    //   mobile_duration: null,
    //   landline_duration: null,
    //   mobile_count: null,
    //   landline_count: null,
    //   total_count: null,
    //   status: 'Pending',
    //   approved_date: '2021-06-29 13:22:25.571286',
    //   approved_by: 'uday@ipsism.co.jp',
    //   billing_period: '04 - 2021',
    //   comment: ''
    // }

    try {
      const [addApprovalRes,addApprovalErr] = await handleError(ApprovalLeafnet.addApprovalStatus(req.body));
      if(addApprovalErr) {
        return res.status(400).json({
            message: addApprovalErr
          });    
           
      }
      if(req && req.body && req.body.status){
        if(req.body.status==='Approve'){
          ApprovalLeafnet.sendApprovalNotification(req.body);
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