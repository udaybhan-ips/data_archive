var db = require('../../config/database');

module.exports = {
    getInvoiceData: async function() {
      try {
          const query=`select *, 
          (select status  from sonus_outbound_approval_history where 
            customer_code='00000594' and invoice_number=cdr_sonus_outbound_summary.invoice_no order by approved_date desc limit 1) as status,
             (select approved_date  from sonus_outbound_approval_history where customer_code='00000594' and 
             invoice_number=cdr_sonus_outbound_summary.invoice_no order by approved_date desc limit 1) as
              approved_date, (select approved_by  from sonus_outbound_approval_history where customer_code='00000594'
               and invoice_number=cdr_sonus_outbound_summary.invoice_no order by approved_date desc limit 1) as approved_by  
               from cdr_sonus_outbound_summary where customer_id='00000594' order by billing_year desc, billing_month desc `;
          const ratesRes= await db.query(query,[]);
          
          if(ratesRes.rows){
              return (ratesRes.rows);              
          }
          return {err:'not found'};
      } catch (error) {
          return error;
      }
  },
 

}


