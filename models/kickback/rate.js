var config = require('./../../config/config');
var db = require('./../../config/database');

module.exports = {


  findAll: async function() {
      try {
        
          const query=" SELECT company_code, date_start, date_expired, rate_setup, rate_trunk_port, date_update, case when updated_by='null' then '' else updated_by end as updated_by, rate_second, deleted, kickack_rate_id  FROM rate_kickback where deleted =false order by company_code asc";
          const rate_kickbackListRes= await db.queryIBS(query,[]);
          return rate_kickbackListRes.rows;
      } catch (error) {
          return error;
      }
  },

  getKickbackFreeDialRate: async function (data) {



    try {
        const query = `select * from kickback_rate where deleted = false order by customer_id`;
        const summaryRes = await db.queryIBS(query, []);

        if (summaryRes.rows) {
            return (summaryRes.rows);
        }
        throw new Error('not found')

    } catch (error) {
        console.log("error in getting kickback free dial rates!" + error.message)
        throw new Error(error.message)
    }
},

updateKickbackFreeDialRate: async function (param) {

  try {
      console.log("data.." + JSON.stringify(param))

      if(param.minute_rate === null || param.minute_rate === undefined || param.minute_rate ==='') {
        throw new Error("Invalid request");
      }

      const query = `update kickback_rate set minute_rate='${param.minute_rate}', 
      update_name='${param.updated_by}', update_date=now() , deleted=${param.deleted} where customer_id = '${param.customer_id}' `;

      const summaryRes = await db.queryIBS(query, []);

      if (summaryRes.rows) {
          return (summaryRes.rows);
      }
      throw new Error('not found')

  } catch (error) {
      console.log("error in getting adding updating kotehi info.." + error.message)
      throw new Error(error.message)
  }
},

addKickbackFreeDialRate: async function (data) {

  try {
      console.log("data here.." + JSON.stringify(data))
      if (data.customer_id == undefined || data.customer_id == '' || data.minute_rate == '' || data.minute_rate == undefined) {
          throw new Error('Invalid request');
      }
      const searchQuery = `select * from kickback_rate where  customer_id= '${data.customer_id}' and deleted = false`;

      const searchRes = await db.queryIBS(searchQuery);
      if (searchRes && searchRes.rows && searchRes.rows.length > 0) {
          throw new Error("This kick company rate is already there, so you can update!!")
      }

      const insertQuery = `insert into kickback_rate (customer_id, minute_rate, rate_valid_start, rate_valid_end, record_name, record_date) Values 
          ('${data.customer_id}','${data.minute_rate}','${data.rate_valid_start}','${data.rate_valid_end}','${data.added_by}',now()) returning data_id`;

      const insertRes = await db.queryIBS(insertQuery, []);


      if(insertRes && insertRes.rowCount > 0){
        return insertRes.rowCount;        
      }else{
        throw new Error(insertRes)
      }

  } catch (error) {
      console.log("error in getting adding kick company rate info..." + error.message)
      throw new Error(error.message)
  }
},


  create: async function(data) {
    console.log(data);
    try {
      //  if(validaterate_kickbackData()){
            const query=`INSERT INTO rate_kickback (company_code,  date_start, date_expired, rate_setup, rate_second,
               rate_trunk_port, date_update, updated_by  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning company_code`;
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
            const query=`INSERT INTO rate_kickback_history (company_code, date_start, date_expired, rate_setup, rate_second, 
              rate_trunk_port, date_update, updated_by ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning company_code`;
            const value= [ data.company_code, data.date_start, data.date_expired, data.rate_setup, 
              data.rate_second, data.rate_trunk_port, 'now()', data.updated_by];
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

            const queryUpdate= `update rate_kickback set ${updateData} where  company_code='${data.company_code}'`;
            const resUpdate = await db.queryIBS(queryUpdate,[]);

            return resUpdate.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },

  
}
