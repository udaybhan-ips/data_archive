var config = require('./../../config/config');
var db = require('./../../config/database');

module.exports = {
  findAll: async function() {
      try {
          const query="SELECT * FROM cdr_sonus_rate order by rate_id asc";
          const rateListRes= await db.query(query,[]);
          return rateListRes.rows;
      } catch (error) {
          return error;
      }
  },

  create: async function(data) {
    console.log(data);
    try {
      //  if(validateRateData()){
            const query=`INSERT INTO cdr_sonus_rate (company_code, carrier_code, carrier_name, call_sort, 
                date_start, date_expired, rate_setup, rate_second, date_updated, currnet_flag,updated_by  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning rate_id`;
            const value= [data.company_code, data.carrier_code, data.carrier_name, data.call_sort, 
                data.date_start, data.date_expired, data.rate_setup, data.rate_second, 'now()', data.current_flag, data.updated_by];
            const res = await db.query(query,value);
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
            const query=`INSERT INTO cdr_sonus_rate_history (company_code, carrier_code, carrier_name, call_sort, 
                date_start, date_expired, rate_setup, rate_second, date_updated, currnet_flag ,rate_id, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11, $12) returning rate_id`;
            const value= [data.company_code, data.carrier_code, data.carrier_name, data.call_sort, 
                data.date_start, data.date_expired, data.rate_setup, data.rate_second, 'now()', data.current_flag, data.rate_id, data.updated_by];
            const res = await db.query(query,value);

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

            if(data.rate_second){
              updateData = updateData+ 'rate_second='+data.rate_second+',';
            }

            if(data.updated_by){
              updateData = updateData+ `updated_by = '${data.updated_by}'`;
            }

            // remove ',' from last character
            // if(updateData.substr(updateData.length - 1)==','){
            //   updateData = updateData.substring(0, updateData.length - 1);
            // }

            const queryUpdate= `update cdr_sonus_rate set ${updateData} where  rate_id='${data.rate_id}'`;
            const resUpdate = await db.query(queryUpdate,[]);

            return resUpdate.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },

  
}
