var config = require('../../config/config');
var db = require('../../config/database');

module.exports = {
  findAll: async function() {
      try {
        console.log("in carrier");
          const query="select *, (select company_name from company where company.company_code=carrier.company_code limit 1) as company_name from carrier where deleted=false order by carrier_code asc";
          const carrierListRes= await db.queryIBS(query,[]);
          return carrierListRes.rows;
      } catch (error) {
          return error;
      }
  },

  create: async function(data) {
    console.log(data);
    try {
      //  if(validatecarrierData()){
            const query=`INSERT INTO carrier (carrier_code,carrier_name, company_code, carrier_name_hikari, date_update, term_use,date_start
              ,date_expired,rate_setup,  rate_second, rate_trunk_port) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11 ) returning carrier_code`;
            const value= [data.carrier_code, data.carrier_name, data.company_code, data.carrier_name_hikari,'now()',  data.term_use, 
          data.date_start, data.date_expired, data.rate_setup, data.rate_second, data.rate_trunk_port ];
            const res = await db.queryIBS(query,value);
            return res.rows[0];
      //  }
    } catch (error) {
        console.log("error in create carrier "+error.message);
        return error;
    }
  },
  updateCarrier: async function(data) {
    console.log(data);
    let updateData='';
    try {
      //  if(validatecarrierData()){
          // create history   
            const query=`INSERT INTO carrier_history (carrier_code,carrier_name, company_code, carrier_name_hikari, date_update,modified_by,  term_use ,date_start
              ,date_expired,rate_setup,  rate_second, rate_trunk_port) 
            VALUES ($1, $2, $3, $4, $5,  $6, $7, $8, $9,$10, $11) returning id`;
            const value= [data.carrier_code, data.carrier_name, data.company_code, data.carrier_name_hikari,'now()', data.modified_by,  data.term_use, 
            data.date_start, data.date_expired, data.rate_setup, data.rate_second, data.rate_trunk_port];
            const res = await db.queryIBS(query,value);

            // if(data.carrier_code){
            //   updateData = 'carrier_code='+data.carrier_code+',';
            // }
           
            updateData = updateData + 'carrier_name='+`'${data.carrier_name}'`+',';
            updateData = updateData + 'deleted='+`'${data.deleted}'`+',';
           
            updateData = updateData + 'carrier_name_hikari='+`'${data.carrier_name_hikari}'`+',';
            updateData = updateData + 'modified_by='+`'${data.modified_by}'`+',';
          //  updateData = updateData + 'valid_flag='+data.valid_flag+',';
           // updateData = updateData + 'carrier_code2='+`'${data.carrier_code2}'`+',';
            updateData = updateData + 'term_use='+`'${data.term_use}'`+',';
            
            if(data.date_start){
              updateData = updateData + 'date_start='+`'${data.date_start}'`+',';
            }
           if(data.date_expired){
            updateData = updateData + 'date_expired='+`'${data.date_expired}'`+',';
           }

            if(data.rate_setup){
              updateData = updateData + 'rate_setup='+`'${data.rate_setup}'`+',';
            }
           if(data.rate_second){
            updateData = updateData + 'rate_second='+`'${data.rate_second}'`+',';
           }
            if(data.rate_trunk_port){
              updateData = updateData + 'rate_trunk_port='+`'${data.rate_trunk_port}'`;
            }
            

            
            //remove ',' from last character
            if(updateData.substr(updateData.length - 1)==','){
              updateData = updateData.substring(0, updateData.length - 1);
            }

            let where =  `where id='${data.id}'`;

            // if(data.company_code){
            //   where = where + `and company_code ='${data.company_code}'`;
            // }

            const queryUpdate= `update carrier set ${updateData} ${where} `;

            console.log("carrier update .. "+queryUpdate);

            const resUpdate = await db.queryIBS(queryUpdate,[]);

            return resUpdate.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },

  
}
