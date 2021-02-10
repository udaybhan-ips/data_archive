var db = require('./../../config/database');

module.exports = {
    getSummary: async function() {
      try {
          const query=`select count(*) as total, sum(duration_use) as duration, start_time::date as day, billing_comp_name,billing_comp_code from cdr_sonus_outbound 
          where to_char(start_time, 'MM-YYYY') = '12-2020' group by start_time::date, billing_comp_name,billing_comp_code order by start_time::date asc `;
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


