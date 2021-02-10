var db = require('../../config/database');

module.exports = {
    getInvoiceData: async function() {
      try {
          const query=`select b.Term_Carrier_ID  || '-' || c.Carrier_Name as carrier_name_id, SUM(b.Duration_Use) as total_duration, round(SUM(a.total_amount), 2) as total_amount from CDR_SONUS_BILLING a, CDR_SONUS b, CDR_SONUS_RATE c where a.CDR_ID = b.CDR_ID and a.Rate_ID = c.Rate_ID group by b.Term_Carrier_ID, c.Carrier_Name order by b.Term_Carrier_ID`;
          const ratesRes= await db.query(query,[]);
          
          if(ratesRes.rows){
              return (ratesRes.rows);              
          }
          return {err:'not found'};
      } catch (error) {
          return error;
      }
  },
  
getTargetCDR: async function(targetDate) {
    
    try {
        const query=`SELECT billing_comp_code, term_carrier_id, duration, cdr_id  from CDR_SONUS ` ;
        const data= await db.query(query);
        return data.rows;
    } catch (error) {
        return error;
    }
}, 
  
}


