var db = require('../../config/database');
var utility= require('./../../public/javascripts/utility');

module.exports = {
    getStatusByInvoiceNo: async function(data) {
        try {
            const query=`select * from sonus_outbound_approval_history where invoice_number='${data.invoice_no}' order by approved_date desc `;
            const invoiceStatusRes= await db.query(query,[]);
            console.log(query);
            if(invoiceStatusRes.rows){
                return invoiceStatusRes.rows;              
            }
            return {err:'not found'};
        } catch (error) {
            return error;
        }
    },
    addApprovalStatus: async function(data) {
        try {
            const query=`insert into sonus_outbound_approval_history (invoice_number , customer_code , customer_name , billing_month , billing_date , amount , status , approved_date , approved_by , revision , comment) 
            VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10,$11) returning id`;
    
            let valueArray=[];
            valueArray.push(data.invoice_no);
            valueArray.push((data.customer_id));
            valueArray.push(data.customer_name);
            valueArray.push(data.billing_month);
            valueArray.push(data.billing_date);
            valueArray.push(data.total_amt);
            valueArray.push((data.status));
            valueArray.push('now()');
            valueArray.push(data.approved_by);
            valueArray.push(data.revision);
            valueArray.push(data.comment);
    
            const addApprovalRes= await db.query(query,valueArray);
            if(addApprovalRes.row){
                return addApprovalRes.rows;
            }else{
                return  addApprovalRes.message;
            }
            
        } catch (error) {
            return error;
        }
    }, 
    sendApprovalNotification: async function(reqData){
        let subject = `Approval Notification for ${reqData.customer_name} of ${utility.dateVsMonths[reqData.billing_month]}`;
        let html = `<div>
            <div> Hi Team, </div>
            <div> Below is the billing status of ${reqData.customer_name} . This is approved by ${reqData.approved_by}.</div>
            <div>http://10.168.22.40/services/leafnet</div>
            <div> Thank you </div>
        </div>`;

        let mailOption={
            from: 'ips_tech@sysmail.ipsism.co.jp',
            to: 'uday@ipsism.co.jp',
            cc:'y_ito@ipsism.co.jp',
            subject,
            html
        }
    
       utility.sendEmail(mailOption);   
    }  
  
}


