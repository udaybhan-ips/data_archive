var db = require('./../../../config/database');

module.exports = {
    getSummaryByMonth: async function({year, month}) {

        try {
          const query=`select * from byokakin_billing_history where cdrmonth::date = '${year}-${month}-01' `;
          const summaryRes= await db.queryByokakin(query,[]);
          
          if(summaryRes.rows){
              return (summaryRes.rows);              
          }
          throw new Error('not found')

      } catch (error) {
            console.log("error in getting summary data")
            throw new Error(error)
      }
  },
  
 
  
}


