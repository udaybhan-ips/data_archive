var config = require('../../config/config');
var db = require('../../config/database');

module.exports = {
  findAll: async function() {
      try {
        console.log("in company");
          const query=`select *  from company where deleted=false order by company_code asc`;
          const companyListRes= await db.queryIBS(query,[]);
          return companyListRes.rows;
      } catch (error) {
          return error;
      }
  },

  create: async function(data) {
    console.log(data);
    try {
      //  if(validatecompanyData()){
            const query=`INSERT INTO company (company_code,company_name,payment_due_date,  company_name_abb, date_update, valid_flag, obic ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) returning company_code`;
            const value= [data.company_code, data.company_name,data.payment_due_date, data.company_name_abb,'now()', data.valid_flag, data.obic ];
            const res = await db.queryIBS(query,value);
            return res.rows[0];
      //  }
    } catch (error) {
        console.log("error in create company "+error.message);
        return error;
    }
  },
  updateCompany: async function(data) {
    console.log(data);
    let updateData='';
    try {
      //  if(validatecompanyData()){
          // create history   
            const query=`INSERT INTO company_history (company_code,company_name,payment_due_date,  company_name_abb, date_update, valid_flag, obic ) 
            VALUES ($1, $2, $3, $4, $5, $6,$7) returning id`;
            const value= [data.company_code, data.company_name,data.payment_due_date, data.company_name_abb,'now()', data.valid_flag, data.obic];
            const res = await db.queryIBS(query,value);

            // if(data.carrier_code){
            //   updateData = 'carrier_code='+data.carrier_code+',';
            // }
           
            updateData = updateData + 'company_name='+`'${data.company_name}'`+',';
            updateData = updateData + 'deleted='+`'${data.deleted}'`+',';
            updateData = updateData + 'payment_due_date='+`'${data.payment_due_date}'`+',';
            updateData = updateData + 'company_name_abb='+`'${data.company_name_abb}'`+',';
            updateData = updateData + 'modified_by='+`'${data.modified_by}'`+',';
            updateData = updateData + 'valid_flag='+data.valid_flag+',';
           // updateData = updateData + 'company_code2='+`'${data.company_code2}'`+',';
            updateData = updateData + 'obic='+`'${data.obic}'`;
            
            // remove ',' from last character
            // if(updateData.substr(updateData.length - 1)==','){
            //   updateData = updateData.substring(0, updateData.length - 1);
            // }

            const queryUpdate= `update company set ${updateData} where  company_code='${data.company_code}'`;
            const resUpdate = await db.queryIBS(queryUpdate,[]);

            return resUpdate.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },

  
}
