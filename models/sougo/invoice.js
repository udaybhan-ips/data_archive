var db = require('../../config/database');

module.exports = {
    getInvoiceData: async function() {
      try {
          const query=`select bill_no, company_code,(select company_name from company where company.company_code=bill_history.company_code limit 1)
          as company_name , date_bill , call_count, date_payment, EXTRACT(YEAR FROM  date_bill)as billing_year, 
          EXTRACT(MONTH FROM  date_bill) as billing_month ,  amount::int ,  tax::int  from bill_history order by bill_no desc; `;
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

