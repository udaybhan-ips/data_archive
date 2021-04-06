var db = require('../../config/database');

module.exports = {
    getInvoiceData: async function() {
      try {
          const query=`select csos.*, csah.status, csah.approved_by , csah.approved_date from (select * from cdr_sonus_outbound_summary where customer_id='00000594')as csos left join (select status,invoice_number, approved_date, approved_by from sonus_outbound_approval_history where customer_code='00000594' order by approved_date desc limit 1) as csah on (csos.invoice_no=csah.invoice_number)`;
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


