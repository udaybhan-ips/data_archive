var db = require('../../config/database');

module.exports = {
    getInvoiceData: async function(data) {

        //console.log("data.."+JSON.stringify(data))
      try {
 
        let where = "" ;

        if(data && data.year && data.month){
            where = `WHERE date_bill::date ='${data.year}-${data.month}-01'`
        }

          const query=`select bill_no as id,  bill_no, customer_code,
          (select customer_name from m_customer where customer_cd=customer_code limit 1)
           as customer_name , 
           (select status  from kickback_sougo_approval_history where  
            invoice_number::int=kickback_history.bill_no and kickback_sougo_approval_history.customer_code = kickback_history.customer_code order by approved_date desc limit 1) as status,
             (select approved_date  from kickback_sougo_approval_history where 
             invoice_number::int=kickback_history.bill_no and kickback_sougo_approval_history.customer_code = kickback_history.customer_code order by approved_date desc limit 1) as approved_date,
              (select approved_by  from kickback_sougo_approval_history where 
              invoice_number::int=kickback_history.bill_no and kickback_sougo_approval_history.customer_code = kickback_history.customer_code order by approved_date desc limit 1) as approved_by,
           date_bill , call_count, date_payment, EXTRACT(YEAR FROM  date_bill)as billing_year, EXTRACT(MONTH FROM  date_bill) as billing_month ,bill_minute, bill_rate, bill_amount::int , amount::int , tax::int, disc_amount
            from kickback_history ${where} order by bill_no desc `;
          const ratesRes= await db.queryIBS(query,[]);
          
          if(ratesRes.rows){
              return (ratesRes.rows);              
          }
          return {err:'not found'};
      } catch (error) {

        console.log("Error in fetching data "+error.message)
          return error;
      }
  },
 

}


