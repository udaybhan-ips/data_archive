var db = require('./../../config/database');

module.exports = {
    getSummary: async function() {
      try {
          const query=`select * from cdr_sonus_outbound_summary where billing_year='2021'`;
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


