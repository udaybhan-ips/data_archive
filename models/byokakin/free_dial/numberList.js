var db = require('../../../config/database');

module.exports = {
    getFreeDialNumberList: async function({comp_code, month}) {

        try {
          const query=`select * from ntt_kddi_freedial_c where cust_code__c='${comp_code}' `;
          const summaryRes= await db.queryByokakin(query,[]);
          
          if(summaryRes.rows){
              return (summaryRes.rows);              
          }
          throw new Error('not found')

      } catch (error) {
            console.log("error in getting free dial number list")
            throw new Error(error.message)
      }
  },
  
 
  
}


