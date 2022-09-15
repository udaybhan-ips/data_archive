var db = require('../../../config/database');

module.exports = {
    getAccountInfo: async function(data) {

        try {

            let carrierWhere = "";

            if(data.carriername!=='' && data.carriername!==undefined && data.carriername!==null){
              carrierWhere = `and carriername = '${data.carriername}'`;
            }

          const query=`select dataid as id, carriername, comp_code__c, accountname, accountid, accountpassword, useddate, registerby, 
          registerdate, modifyby, modifydate, deleted from free_call_account where deleted= false ${carrierWhere} order by  comp_code__c` ;

        //  console.log("query.."+query)

          const summaryRes= await db.queryByokakin(query,[]);
          
          if(summaryRes.rows){
              return (summaryRes.rows);              
          }
          throw new Error('not found')

      } catch (error) {
            console.log("error in getting ntt kddi account configuration!"+error.message)
            throw new Error(error.message)
      }
  },

  updateAccountInfo: async function(param) {

    try {
        console.log("data.."+ JSON.stringify(param))

      const query=`update free_call_account set accountid='${param.accountid}' , accountpassword='${param.accountpassword}', deleted=${param.deleted}, 
      modifyby='${param.modifyby}', modifydate= now()   where dataid = ${param.id} `;

      const summaryRes= await db.queryByokakin(query,[]);
      
      if(summaryRes.rows){
          return (summaryRes.rows);              
      }
      throw new Error('not found')

  } catch (error) {
        console.log("error in getting adding updating kotehi info.."+error.message)
        throw new Error(error.message)
  }
},

addAccountInfo: async function(data) {

    try {

    
        console.log("data here.."+ JSON.stringify(data))

        if(data.comp_code == undefined || data.comp_code == '' ||  data.carriername == '' || data.carriername == undefined){
            throw new Error('Invalid request');
        }

        let accountid = data.accountid.trim();
        let accountpassword = data.accountpassword.trim();

        
        const searchQuery = `select * from free_call_account where 
        accountid = '${accountid}' and carriername='${data.carriername}' 
        and comp_code__c= '${data.comp_code}' and deleted = false`;

        console.log("searchQuery.."+ (searchQuery))

        const searchRes = await db.queryByokakin(searchQuery);
        if(searchRes && searchRes.rows && searchRes.rows.length >0){
            throw  new Error("This number number already there, so you can update that number!!")
        }


        const insertQuery = `insert into free_call_account (comp_code__c, accountname, carriername, accountid, accountpassword,
                 useddate, registerdate, registerby) Values 
                ('${data.comp_code}','${data.compName}','${data.carriername}','${accountid}', '${accountpassword}',
                '${data.useddate}',now(), '${data.added_by}')`;
            
        const insertRes = await db.queryByokakin(insertQuery,[]);      
    
        return insertRes.rowCount;

  } catch (error) {
        console.log("error in getting account info..."+error.message)
        throw new Error(error.message)
  }
},
 
  
}


