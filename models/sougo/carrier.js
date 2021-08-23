var config = require('../../config/config');
var db = require('../../config/database');

module.exports = {
  findAll: async function() {
      try {
        console.log("in carrier");
          const query="select * from carrier where deleted=false order by carrier_code asc";
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
            const query=`INSERT INTO carrier (carrier_code,carrier_name,  carrier_name_hikari, date_update, term_use ) 
            VALUES ($1, $2, $3, $4, $5) returning carrier_code`;
            const value= [data.carrier_code, data.carrier_name, data.carrier_name_hikari,'now()',  data.term_use ];
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
            const query=`INSERT INTO carrier_history (carrier_code,carrier_name,  carrier_name_hikari, date_update,  term_use ) 
            VALUES ($1, $2, $3, $4, $5) returning id`;
            const value= [data.carrier_code, data.carrier_name, data.carrier_name_hikari,'now()',  data.term_use];
            const res = await db.queryIBS(query,value);

            // if(data.carrier_code){
            //   updateData = 'carrier_code='+data.carrier_code+',';
            // }
           
            updateData = updateData + 'carrier_name='+`'${data.carrier_name}'`+',';
            updateData = updateData + 'deleted='+`'${data.deleted}'`+',';
           
            updateData = updateData + 'carrier_name_hikari='+`'${data.carrier_name_hikari}'`+',';
           // updateData = updateData + 'modified_by='+`'${data.modified_by}'`+',';
          //  updateData = updateData + 'valid_flag='+data.valid_flag+',';
           // updateData = updateData + 'carrier_code2='+`'${data.carrier_code2}'`+',';
            updateData = updateData + 'term_use='+`'${data.term_use}'`;
            
            // remove ',' from last character
            // if(updateData.substr(updateData.length - 1)==','){
            //   updateData = updateData.substring(0, updateData.length - 1);
            // }

            const queryUpdate= `update carrier set ${updateData} where  carrier_code='${data.carrier_code}'`;
            const resUpdate = await db.queryIBS(queryUpdate,[]);

            return resUpdate.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },

  
}
