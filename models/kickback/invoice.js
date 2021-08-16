var db = require('../../config/database');

module.exports = {
    getInvoiceData: async function() {
      try {
          const query=`select bill_no, customer_code,(select customer_name from m_customer where customer_cd=customer_code limit 1)
           as customer_name , date_bill , call_count, date_payment, EXTRACT(YEAR FROM  date_bill)as billing_year, EXTRACT(MONTH FROM  date_bill) as billing_month ,bill_minute, bill_rate, bill_amount::int , amount::int , tax::int, disc_amount
            from kickback_history order by bill_no desc `;
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


