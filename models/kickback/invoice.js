var db = require('../../config/database');

module.exports = {
    getInvoiceData: async function() {
      try {
          const query=`select * from kickback_traffic_summary `;
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


