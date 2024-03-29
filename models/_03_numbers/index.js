var db = require('../../config/database');


module.exports = {
  findAll: async function({comp_code}) {
      try {

        //console.log("data..."+JSON.stringify(data))

        let query = "";
        if(comp_code){
          query=`SELECT * FROM _03numbers where customer_cd='${comp_code}' order by _03_numbers asc`;
        }

          
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
            const query=`INSERT INTO _03numers (_03_numbers,customer_cd,use_switch,use_service,wro_number,kck_rate,kaisuu_rate,issue_date,start_date,return_date,stop_date,number_special_flag,use_flag 
              ,valids_date,validf_date,valid_flag , rico_name ,rico_date,modi_name ,date_update) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) returning rate_id`;
            const value= [data._03_number,data.customer_cd,data.use_switch,data.use_service,data.wro_number,data.kck_rate,data.kaisuu_rate,data.issue_date,data.start_date,data.return_date,
              data.stop_date,data.number_special_flag,data.use_flag ,data.valids_date,data.validf_date,data.valid_flag ,data.rico_name ,data.rico_date,data.modi_name];
            const res = await db.queryIBS(query,value);
            return res.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },
  updateNumbers: async function(data) {
    console.log(data);
    let updateData='';
    try {
      //  if(validateRateData()){
          // create history   
            const query=`INSERT INTO rate_history (company_code, date_start, date_expired, rate_setup, rate_second, rate_trunk_port, date_updated, updated_by ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11) returning rate_id`;
            const value= [ data.company_code, data.date_start, data.date_expired, data.rate_setup, data.rate_second, data.rate_trunk_port, 'now()', data.updated_by];
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
              updateData = updateData+ 'rate_second='+data.rate_second;
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
