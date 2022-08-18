var db = require('../../../config/database');

module.exports = {
    getAddiKotehiInfo: async function(data) {

        try {

            let carrierWhere = "";
            if(data.carrier!=='' && data.carrier!==undefined && data.carrier!==null){
              carrierWhere = `and carrier = '${data.carrier}'`;
            }

          const query=`select id, customer_cd, customer_name, carrier, d_fd_n_number, start_date, stop_date , added_by, date_added, 
          case when modified_by='undefined' then '' else modified_by end  as modified_by , modified_date, 
          ips_amount, carrier_amount, product_name from  ntt_kddi_additional_kotehi_detail 
          where deleted=false ${carrierWhere} order by  customer_cd` ;

        //  console.log("query.."+query)

          const summaryRes= await db.queryByokakin(query,[]);
          
          if(summaryRes.rows){
              return (summaryRes.rows);              
          }
          throw new Error('not found')

      } catch (error) {
            console.log("error in getting ntt kddi additional kotehi configuration!"+error.message)
            throw new Error(error.message)
      }
  },

  updateAddiKotehiInfo: async function(param) {

    try {
        console.log("data.."+ JSON.stringify(param))
        let carrier_amount =0 , ips_amount = 0 ; 
        if(param.carrier_amount !==null && param.carrier_amount !== undefined && param.carrier_amount !=='' ){
            carrier_amount = param.carrier_amount;
        }
        
        if(param.ips_amount !== null && param.ips_amount !== undefined && param.ips_amount !==''){
            ips_amount = param.ips_amount;
        }
        
      const query=`update ntt_kddi_additional_kotehi_detail set carrier_amount='${carrier_amount}', ips_amount='${ips_amount}', 
      modified_by='${param.updatedBy}', modified_date=now() , deleted=${param.deleted} where id = ${param.id} `;

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

addAddiKotehiInfo: async function(data) {

    try {

    
        console.log("data here.."+ JSON.stringify(data))

        if(data.comp_code == undefined || data.comp_code == '' ||  data.carrier == '' || data.carrier == undefined){
            throw new Error('Invalid request');
        }

        let d_fd_n_number = data.d_fd_n_number.trim();
        let carrier_amount =0 , ips_amount = 0 ; 
        
        if(data.carrier_amount !==null && data.carrier_amount !== undefined && data.carrier_amount !=='' ){
            carrier_amount = data.carrier_amount;
        }
        
        if(data.ips_amount !== null && data.ips_amount !== undefined && data.ips_amount !==''){
            ips_amount = data.ips_amount;
        }

        const searchQuery = `select * from ntt_kddi_additional_kotehi_detail where 
        d_fd_n_number = '${d_fd_n_number}' and product_name='${data.product_name.trim()}' 
        and carrier='${data.carrier}' and customer_cd= '${data.comp_code}' and deleted = false`;
        console.log("searchQuery.."+ (searchQuery))

        const searchRes = await db.queryByokakin(searchQuery);
        if(searchRes && searchRes.rows && searchRes.rows.length >0){
            throw  new Error("This number number already there, so you can update that number!!")
        }


        const insertQuery = `insert into ntt_kddi_additional_kotehi_detail (customer_cd, customer_name, carrier, d_fd_n_number, 
                 stop_date, added_by, date_added, modified_by, modified_date, product_name, carrier_amount, ips_amount) Values 
                ('${data.comp_code}','${data.compName}','${data.carrier}','${d_fd_n_number}', 
                '3000-01-01','${data.added_by}',now(), '${data.modified_by}', now(), '${data.product_name.trim()}', ${carrier_amount}, ${ips_amount} ) returning id`;
            
        const insertRes = await db.queryByokakin(insertQuery,[]);      
    
        return insertRes.rowCount;

  } catch (error) {
        console.log("error in getting adding additional kotehi info..."+error.message)
        throw new Error(error.message)
  }
},
 
  
}


