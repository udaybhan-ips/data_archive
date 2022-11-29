var config = require('../../config/config');
var db = require('../../config/database');

module.exports = {
  findAll: async function() {
      try {
        console.log("in bill info");
          const query="select * from bill_info order by company_code asc";
          const billInfoListRes= await db.queryIBS(query,[]);
          return billInfoListRes.rows;
      } catch (error) {
          return error;
      }
  },

  create: async function(data) {
    console.log(data);
    try {
      //  if(validatebillInfoData()){
            const query=`INSERT INTO bill_info (billInfo_code,billInfo_name, company_code, billInfo_name_hikari, date_update, term_use,date_start
              ,date_expired,rate_setup,  rate_second, rate_trunk_port) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10,$11 ) returning billInfo_code`;
            const value= [data.billInfo_code, data.billInfo_name, data.company_code, data.billInfo_name_hikari,'now()',  data.term_use, 
          data.date_start, data.date_expired, data.rate_setup, data.rate_second, data.rate_trunk_port ];
            const res = await db.queryIBS(query,value);
            return res.rows[0];
      //  }
    } catch (error) {
        console.log("error in create billInfo "+error.message);
        return error;
    }
  },
  updateBillInfo: async function(data) {
    console.log(data);
    let updateData='';
    try {
      //  if(validatebillInfoData()){
          // create history   
            const query=`INSERT INTO bill_info_history (company_code,zip_code, address1, address2, date_added, person_incharge,tel_no,  fax_no 
              ,memo ,person_incharge_1,  updated_by) 
            VALUES ($1, $2, $3, $4, $5,  $6, $7, $8, $9,$10, $11) returning company_code`;
            const value= [data.company_code, data.zip_code, data.address1, data.address2,'now()', data.person_incharge,  data.tel_no, 
            data.fax_no, data.memo, data.person_incharge_1, data.updatedBy];
            const res = await db.queryIBS(query,value);
          
            updateData = updateData + 'zip_code='+`'${data.zip_code}'`+',';
         
            updateData = updateData + 'deleted='+`'${data.deleted}'`+',';
            updateData = updateData + 'address1='+`'${data.address1}'`+',';
            updateData = updateData + 'address2='+`'${data.address2}'`+',';
            updateData = updateData + 'fax_no='+`'${data.fax_no}'`+',';
            updateData = updateData + 'tel_no='+`'${data.tel_no}'`+',';
            updateData = updateData + 'updated_by='+`'${data.updatedBy}'`+',';
            updateData = updateData + `date_update=now()`;
           
           
            let where =  `where company_code='${data.company_code}'`;

           
            const queryUpdate= `update bill_info set ${updateData} ${where} `;

            console.log("billInfo update .. "+queryUpdate);

            const resUpdate = await db.queryIBS(queryUpdate,[]);

            return resUpdate.rows[0];
      //  }
    } catch (error) {
        throw new Error("Error in updating bill info.."+error.message)
        
    }
  },

  
}
