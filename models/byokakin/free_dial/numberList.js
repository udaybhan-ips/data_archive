var db = require('../../../config/database');

module.exports = {
    getFreeDialNumberList: async function({free_dial_numbers, carrier, comp_code}) {

        try {
         let where  = " WHERE ";
          if((comp_code =='' || comp_code ==undefined ) && (carrier =='' || carrier == undefined) &&  (free_dial_numbers =='' || free_dial_numbers == undefined)) {
            throw new Error ('Invalid serach request');
         }

         if(comp_code){
            where += `cust_code__c = '${comp_code}' AND`;
         }

         if(carrier){
            where += ` carr_comp__c = '${carrier}' AND`;
         }

         if(free_dial_numbers){
            where += ` free_numb__c = '${free_dial_numbers}'`;
         }


         let lastThree = where.slice(where.length - 3);

         if(lastThree === 'AND') {
            where = where.substring(0, where.length-3)
         }
         
          const query=`select * from ntt_kddi_freedial_c_tmp ${where} `;

          console.log("query.."+query)

          const summaryRes= await db.queryByokakin(query,[]);
          
          if(summaryRes.rows){
              return (summaryRes.rows);              
          }
          throw new Error('not found')

      } catch (error) {
            console.log("error in getting free dial number list"+error.message)
            throw new Error(error.message)
      }
  },

  updateFreeDialNumberList: async function({param, ids, updatedBy, remark}) {

    try {
        //console.log("data.."+ JSON.stringify(data))
        if(param.customer_cd == undefined || param.customer_cd == '' || ids.length <=0 ){
            return new Error('Invalid request');
        }

      const query=`update ntt_kddi_freedial_c_tmp set cust_code__c='${param.customer_cd}', upda_name__c='${updatedBy}', 
      used_star__c='${param.modified_date}', date_upda__c=now() , rema_info__c='${remark}' where id in (${ids.toString()}) `;
      const summaryRes= await db.queryByokakin(query,[]);
      
      if(summaryRes.rows){
          return (summaryRes.rows);              
      }
      throw new Error('not found')

  } catch (error) {
        console.log("error in getting free dial number list"+error.message)
        throw new Error(error.message)
  }
},

addFreeDialNumberList: async function({data}) {

    try {
        //console.log("data.."+ JSON.stringify(data))
        if(param.customer_cd == undefined || param.customer_cd == '' || ids.length <=0 ){
            return new Error('Invalid request');
        }

      const query=`update ntt_kddi_freedial_c_tmp set cust_code__c='${param.customer_cd}', upda_name__c='${updatedBy}', 
      used_star__c='${param.modified_date}', date_upda__c=now() , rema_info__c='${remark}' where id in (${ids.toString()}) `;
      const summaryRes= await db.queryByokakin(query,[]);
      
      if(summaryRes.rows){
          return (summaryRes.rows);              
      }
      throw new Error('not found')

  } catch (error) {
        console.log("error in getting free dial number list"+error.message)
        throw new Error(error.message)
  }
},
 
  
}


