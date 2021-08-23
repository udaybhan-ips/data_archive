var config = require('../../config/config');
var db = require('../../config/database');

module.exports = {
  findAll: async function() {
      try {
        console.log("in route");
          const query="SELECT *, (select carrier_name from carrier where carrier.carrier_code=route.carrier_code limit 1)as carrier_name FROM route where deleted=false order by carrier_code asc";
          const rateListRes= await db.queryIBS(query,[]);
          return rateListRes.rows;
      } catch (error) {
          return error;
      }
  },

  create: async function(data) {
    console.log(data);
    try {
      //  if(validateRateData()){
            const query=`INSERT INTO route (carrier_code,relay_code,  date_expired, pattern, term_carrier_id, company_code1, company_code2,
               date_update, relay_carrier  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning carrier_code`;
            const value= [data.carrier_code, data.relay_code, data.date_expired, data.pattern, data.term_carrier_id, data.company_code1, data.company_code2 ,'now()', data.relay_carrier];
            const res = await db.queryIBS(query,value);
            return res.rows[0];
      //  }
    } catch (error) {
        console.log("error in create route "+error.message);
        return error;
    }
  },
  updateRoute: async function(data) {
    console.log(data);
    let updateData='';
    try {
      //  if(validateRateData()){
          // create history   
            const query=`INSERT INTO route_history (id,carrier_code,relay_code, term_carrier_id, date_expired, pattern, company_code1, company_code2,
               date_update, relay_carrier ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10) returning id`;
            const value= [data.id,data.carrier_code, data.relay_code, data.term_carrier_id, data.date_expired, data.pattern, data.company_code1, data.company_code2 ,'now()', data.relay_carrier];
            const res = await db.queryIBS(query,value);

            // if(data.carrier_code){
            //   updateData = 'carrier_code='+data.carrier_code+',';
            // }
           
            updateData = updateData + 'relay_code='+`'${data.relay_code}'`+',';
            updateData = updateData + 'deleted='+`'${data.deleted}'`+',';
           
            updateData = updateData + 'pattern='+data.pattern+',';
            updateData = updateData + 'modified_by='+`'${data.modified_by}'`+',';
            updateData = updateData + 'company_code1='+`'${data.company_code1}'`+',';
            updateData = updateData + 'company_code2='+`'${data.company_code2}'`+',';
            updateData = updateData + 'term_carrier_id='+`'${data.term_carrier_id}'`+',';
            updateData = updateData + 'relay_carrier='+`'${data.relay_carrier}'`;
            
            // remove ',' from last character
            // if(updateData.substr(updateData.length - 1)==','){
            //   updateData = updateData.substring(0, updateData.length - 1);
            // }

            const queryUpdate= `update route set ${updateData} where  id='${data.id}'`;
            const resUpdate = await db.queryIBS(queryUpdate,[]);

            return resUpdate.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },

  
}
