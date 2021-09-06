var config = require('./../../config/config');
var db = require('./../../config/database');

module.exports = {
  findAll: async function() {
      try {
        console.log("in rate");
          const query="SELECT *, (select company_name from company where company.company_code=rate.company_code limit 1) as company_name  FROM rate where deleted=false order by company_code asc";
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
            const query=`INSERT INTO rate (company_code,  date_start, date_expired, rate_setup, rate_second, rate_trunk_port, date_update, 
              updated_by  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning company_code`;
            const value= [data.company_code, data.date_start, data.date_expired, data.rate_setup, data.rate_second, data.rate_trunk_port ,'now()', data.updated_by];
            const res = await db.queryIBS(query,value);
            return res.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },
  updateRates: async function(data) {
    console.log(data);
    let updateData='';
    try {
      //  if(validateRateData()){
          // create history   
            const query=`INSERT INTO rate_history (company_code, date_start, date_expired, rate_setup, rate_second, 
              rate_trunk_port, date_update, updated_by ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning company_code`;
            const value= [ data.company_code, data.date_start, data.date_expired, 
              data.rate_setup, data.rate_second, data.rate_trunk_port, 'now()', data.update];
            const res = await db.queryIBS(query,value);

            // if(data.carrier_code){
            //   updateData = 'carrier_code='+data.carrier_code+',';
            // }
            // if(data.carrier_name){
            //   updateData = updateData +'carrier_name='+data.carrier_name+',';
            // }

            // if(data.call_sort){
            //   updateData = updateData + 'call_sort='+data.call_sort+',';
            // }

            // if(data.date_start){
            //   updateData = updateData + 'date_start='+data.date_start+',';
            // }

            // if(data.date_expired){
            //   updateData = updateData + 'date_expired='+data.date_expired+',';
            // }
            if(data.rate_setup){
              updateData = updateData + 'rate_setup='+data.rate_setup+',';
            }
            
            if(data.rate_trunk_port){
              updateData = updateData + 'rate_trunk_port='+data.rate_trunk_port+',';
            }
            
            if(data.rate_second){
              updateData = updateData+ 'rate_second='+data.rate_second+',';
            }
            if(data.deleted){
              updateData = updateData +'deleted='+data.deleted+',';
            }

            if(data.updated_by){
              updateData = updateData +'updated_by='+`'${data.updated_by}'`+',';
            }


            // remove ',' from last character
            if(updateData.substr(updateData.length - 1)==','){
              updateData = updateData.substring(0, updateData.length - 1);
            }

            const queryUpdate= `update rate set ${updateData} where  company_code='${data.company_code}'`;
            const resUpdate = await db.queryIBS(queryUpdate,[]);

            return resUpdate.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },

  
}
