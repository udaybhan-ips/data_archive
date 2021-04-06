var db = require('../../config/database');

module.exports = {
    getStatusByInvoiceNo: async function(data) {
        console.log("in get");

        try {
            const query=`select * from sonus_outbound_approval_history where invoice_number='${data.invoice_no}' `;
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
        //console.log("data");
        //console.log(data);
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
  
}


