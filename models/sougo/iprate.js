var config = require('./../../config/config');
var db = require('./../../config/database');

module.exports = {
  findAll: async function() {
      try {
        console.log("in rate");
          const query=`SELECT *, (select company_name from company where company.company_code=ipdata_rate.company_code limit 1) as 
          company_name  FROM ipdata_rate where deleted=false order by company_code asc`;
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

      const company_codeArr = data.comp_code.split(",");
      const company_code = company_codeArr[0];


            const query=`INSERT INTO ipdata_rate (host_name, company_code,typeof_call, rate_setup, rate_second, rate_trunk_port, added_by, date_added
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning company_code`;
            const value= [data.host_name, company_code, data.typeof_call, data.rate_setup, data.rate_second, data.rate_trunk_port ,data.added_by, 'now()'];
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
            const query=`INSERT INTO ipdata_rate_history (host_name, company_code, typeof_call, rate_setup, rate_second, 
              rate_trunk_port, update_date, updated_by ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) returning company_code`;
            const value= [ data.host_name, data.company_code, data.typeof_call,  
              data.rate_setup, data.rate_second, data.rate_trunk_port, 'now()', data.updated_by];
            const res = await db.queryIBS(query,value);

           
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

            const queryUpdate= `update ipdata_rate set ${updateData}  update_date = now()  
            where  id='${data.id}'`;
            const resUpdate = await db.queryIBS(queryUpdate,[]);

            return resUpdate.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },

  
}
