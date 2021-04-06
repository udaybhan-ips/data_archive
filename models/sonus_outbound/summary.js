var db = require('./../../config/database');

module.exports = {
    getSummary: async function() {
      try {
          const query=`select * from cdr_sonus_outbound_summary where customer_id!='00000594'`;
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


