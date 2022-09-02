var config = require('./../../../config/config');
var db = require('./../../../config/database');

module.exports = {
  findAll: async function (data) {
    try {
     // console.log("in rate_KDDI"+JSON.stringify(data));
      const query = "select * from ntt_kddi_rate_c where serv_name='NTT' order by customer_code asc";
      const nttRateList = await db.queryByokakin(query, []);
      if (nttRateList && nttRateList.rows) {
        return nttRateList.rows;
      }
      else {
        throw new Error(nttRateList)
      }

    } catch (error) {
      throw new Error(error.message);
    }
  },

  create: async function (data) {
    console.log("data is "+ JSON.stringify(data));
    try {
     
      if(!data || !data.customer_cd || !data.serv_name){
        throw new Error('invalid data');
      }

      const validateDataQuery = `select * from ntt_kddi_rate_c 
      where customer_code ='${data.customer_cd}' and  serv_name ='${data.serv_name}' ` ;
      const validateDataQueryRes = await db.queryByokakin(validateDataQuery, []);

      if(validateDataQueryRes && validateDataQueryRes.rows && validateDataQueryRes.rows.length> 0){
        throw new Error('customer already registed..');
      }

      const query = `INSERT INTO ntt_kddi_rate_c (customer_code, serv_name, fixed_rate, mobile_rate, public_rate, 
        navi_dial_rate, sonota_rate, start_date, end_date, date_added, date_modified,  added_by, modified_by ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13 ) returning customer_code`;
      const value = [data.customer_cd, data.serv_name, JSON.stringify(data.fixed_rate), JSON.stringify(data.mobile_rate),
        JSON.stringify(data.public_rate), JSON.stringify(data.navi_dial_rate), JSON.stringify(data.sonota_rate), data.start_date, data.end_date,
      'now()', 'now()', data.added_by, data.modified_by];
      const res = await db.queryByokakin(query, value);
      if (res.rows)
        return res.rows[0];
      else
        throw new Error(res);
      //  }
    } catch (error) {
      throw new Error(error);
    }
  },
  updateRates: async function (data) {
    console.log(data);
    let updateData = '';
    try {

      // check if data is exit ?

      const dateCheck = `select * from ntt_kddi_rate_c where serv_name='NTT' and customer_code= '${data.customer_cd}' `;
      const dateCheckRes = await db.queryByokakin(dateCheck, []);

      if(dateCheckRes && dateCheckRes.rows && dateCheckRes.rows.length <=0) {

        const query = `INSERT INTO ntt_kddi_rate_c (customer_code, serv_name, fixed_rate, mobile_rate, public_rate, 
          navi_dial_rate, sonota_rate, start_date, end_date, date_added, date_modified,  added_by, modified_by ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13 ) returning customer_code`;
        const value = [data.customer_cd, 'NTT' , JSON.stringify(data.fixed_rate), JSON.stringify(data.mobile_rate),
          JSON.stringify(data.public_rate), JSON.stringify(data.navi_dial_rate), JSON.stringify(data.sonota_rate), data.start_date, data.end_date,
        'now()', 'now()', data.added_by, data.modified_by];
        const res = await db.queryByokakin(query, value);
        return res;
      }

    
      const query = `INSERT INTO ntt_kddi_rate_c_history (customer_code, serv_name, fixed_rate, mobile_rate, public_rate, 
        navi_dial_rate, sonota_rate, start_date, end_date, date_added, date_modified,  added_by, modified_by ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13 ) returning customer_code`;
        const value = [data.customer_cd, data.serv_name, JSON.stringify(data.fixed_rate), JSON.stringify(data.mobile_rate),
          JSON.stringify(data.public_rate), JSON.stringify(data.navi_dial_rate), JSON.stringify(data.sonota_rate), data.start_date, data.end_date,
        'now()', 'now()', data.added_by, data.modified_by];
      const res = await db.queryByokakin(query, value);

      if (data.fixed_rate) {
        updateData = 'fixed_rate=' + `'${JSON.stringify(data.fixed_rate)}'` + ',';
      }
      if (data.mobile_rate) {
        updateData = updateData + 'mobile_rate=' + `'${JSON.stringify(data.mobile_rate)}'` + ',';
      }

      if (data.public_rate) {
        updateData = updateData + 'public_rate=' + `'${JSON.stringify(data.public_rate)}'` + ',';
      }

      if (data.navi_dial_rate) {
        updateData = updateData + 'navi_dial_rate=' + `'${JSON.stringify(data.navi_dial_rate)}'` + ',';
      }

      if (data.sonota_rate) {
        updateData = updateData + 'sonota_rate=' + `'${JSON.stringify(data.sonota_rate)}'` + ',';

      }

      if (data.end_date) {
        updateData = updateData + 'end_date=' + `'${data.end_date}'` + ',';
      }

      if (data.modified_by) {
        updateData = updateData + 'modified_by=' + `'${data.modified_by}'` + ',';
      }

      updateData = updateData + 'date_modified= now()';

      const queryUpdate = `update ntt_kddi_rate_c set ${updateData} where  customer_code='${data.customer_cd}' and serv_name='NTT' `;
      const resUpdate = await db.queryByokakin(queryUpdate, []);
      if (resUpdate.rows)
        return resUpdate.rows[0];
      else
        throw new Error(resUpdate);
      //  }
    } catch (error) {
      throw new Error(error);

    }
  },


}
