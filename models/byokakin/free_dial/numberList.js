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

            let freeDialNumberArr = free_dial_numbers.split(",");
            let freeDialNumbers = "";
            let length = freeDialNumberArr.length -1 ;
            freeDialNumberArr.forEach((e, index)=>{
                if(length == index ){
                    freeDialNumbers += `'${e.trim()}'`; 
                }else{
                    freeDialNumbers += `'${e.trim()}',`; 
                }            
            })
            where += ` free_numb__c in  (${freeDialNumbers}) `;
         }



         let lastThree = where.slice(where.length - 3);

         if(lastThree === 'AND') {
            where = where.substring(0, where.length-3)
         }
         
          const query=`select * from ntt_kddi_freedial_c ${where} order by free_numb__c`;

        //  console.log("query.."+query)
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
        console.log("data.."+ JSON.stringify(param))
        if(param.customer_cd == undefined || param.customer_cd == '' || ids.length <=0 ){
            throw new Error('Invalid request');
        }

        if(param.carrier_type == undefined || param.carrier_type == '' || param.carrier_type == null){
            throw new Error('Invalid request');
        }

        let stopDate = null;

        if(param.stop_date__c != undefined && param.stop_date__c!='' && param.stop_date__c!=null) {
            stopDate =  param.stop_date__c;
        }
    
        const insertHistoryQuery =`insert into ntt_kddi_freedial_history_c(cust_code__c, carr_comp__c, free_numb__c, regi_name__c, upda_name__c, 
            cust_code, reuse_count, data_idno, id, used_star__c,date_upda__c, stop_date__c, rema_info__c, date_regi__c)  
             ( select cust_code__c, carr_comp__c, free_numb__c, regi_name__c, upda_name__c, cust_code, reuse_count, data_idno, id, 
                used_star__c,date_upda__c, stop_date__c, rema_info__c, date_regi__c from ntt_kddi_freedial_c where id in (${ids.toString()}))` ;
        
       const insertHistoryQueryRes = await db.queryByokakin(insertHistoryQuery, []);
    

      const query=`update ntt_kddi_freedial_c set cust_code__c='${param.customer_cd}', upda_name__c='${updatedBy}', carr_comp__c='${param.carrier_type}',
      used_star__c='${param.modified_date}', stop_date__c='${stopDate}',  date_upda__c=now() , rema_info__c='${remark}' where id in (${ids.toString()}) `;


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

addFreeDialNumberList: async function(data) {

    try {
        console.log("data.."+ JSON.stringify(data))
        if(data.comp_code == undefined || data.comp_code == '' || data.free_dial_numbers == undefined || data.free_dial_numbers == ''){
            throw new Error('Invalid request');
        }

        let freeDialNumberArr = data.free_dial_numbers.split(",");
        let freeDialNumbers = "";
        let length = freeDialNumberArr.length -1 ;
        freeDialNumberArr.forEach((e, index)=>{
            if(length == index ){
                freeDialNumbers += `'${e.trim()}'`; 
            }else{
                freeDialNumbers += `'${e.trim()}',`; 
            }            
        })


        const searchQuery = `select * from ntt_kddi_freedial_c where 
        free_numb__c in (${freeDialNumbers})  `;
        
        console.log("searchQuery.."+ (searchQuery))

        const searchRes = await db.queryByokakin(searchQuery);
        if(searchRes && searchRes.rows && searchRes.rows.length >0){
            throw  new Error("This number number already there... Please go search page!")
        }


        let insertQuery = "";
        let res = [];

        for(let i= 0; i< freeDialNumberArr.length; i++){

            insertQuery = `insert into ntt_kddi_freedial_c (cust_code__c, carr_comp__c, free_numb__c, regi_name__c, 
                 cust_code, used_star__c, rema_info__c, date_regi__c) Values 
                ('${data.comp_code}','${data.carrier}','${freeDialNumberArr[i]}', '${data.updatedBy}','${parseInt(data.comp_code)}'
                ,'${data.start_date}','${data.remark}',now()) returning id`;
            
            const insertRes = await db.queryByokakin(insertQuery,[]);      
              
            if(insertRes && insertRes.rows && insertRes.rows.length>0){
               res.push(insertRes.rows[0].id)
            }                
        }

        return res;

  } catch (error) {
        console.log("error in getting free dial number list"+error.message)
        throw new Error(error.message)
  }
},
 
  
}


