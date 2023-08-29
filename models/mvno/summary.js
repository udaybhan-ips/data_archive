var db = require('./../../config/database');

module.exports = {
    getSummary: async function() {
      try {
          const query=`select *, 
          (select status  from mvno_approval_history where invoice_number=cdr_mvno_summary.invoice_no order by approved_date desc limit 1) as status,
           (select approved_date  from mvno_approval_history where invoice_number=cdr_mvno_summary.invoice_no order by approved_date desc limit 1) as approved_date,
            (select approved_by  from mvno_approval_history where invoice_number=cdr_mvno_summary.invoice_no order by approved_date desc limit 1) as approved_by  
            from cdr_mvno_summary order by billing_year desc, billing_month desc , customer_name, leg`;
          const ratesRes= await db.queryIBS(query,[]);
          
          if(ratesRes.rows){
              return (ratesRes.rows);              
          }
          return {err:'not found'};
      } catch (error) {
          return error;
      }
  },
  
 
  
}


