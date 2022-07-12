var config = require('./../../../config/config');
var db = require('./../../../config/database');

module.exports = {
  findAll: async function () {
    try {
      console.log("in rate_NTT");
      const query = "select * from ntt_kddi_rate where serv_name='NTT' order by customer_code, rate_type asc";
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
     
      if(!data || !data.customer_cd || !data.rate_type || !data.serv_name){
        throw new Error('invalid data');
      }

      const validateDataQuery = `select * from ntt_kddi_rate 
      where customer_code ='${data.customer_cd}' and  serv_name ='${data.serv_name}' and rate_type = '${data.rate_type}'` ;
      const validateDataQueryRes = await db.queryByokakin(validateDataQuery, []);

      if(validateDataQueryRes && validateDataQueryRes.rows && validateDataQueryRes.rows.length> 0){
        throw new Error('customer already registed..');
      }

      const query = `INSERT INTO ntt_kddi_rate (customer_code, serv_name, fixed_rate, mobile_rate, public_rate, 
              ips_fixed_rate, ips_mobile_rate, ips_public_rate, start_date, end_date, fixed_billing_type, mobile_billing_type, public_billing_type,
              date_added, date_modified,  added_by, modified_by, rate_type ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 
                $10, $11, $12, $13, $14, $15, $16 ,$17, $18  ) returning customer_code`;
      const value = [data.customer_cd, data.serv_name, data.fixed_rate, data.mobile_rate,
      data.public_rate, data.ips_fixed_rate, data.ips_mobile_rate, data.ips_public_rate, data.start_date, data.end_date,
      data.fixed_billing_type, data.mobile_billing_type, data.public_billing_type, 'now()', 'now()', data.added_by,
      data.modified_by, data.rate_type];
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
      const query = `INSERT INTO ntt_kddi_rate_history (customer_code, serv_name, fixed_rate, mobile_rate, public_rate, 
              ips_fixed_rate, ips_mobile_rate, ips_public_rate, start_date, end_date, fixed_billing_type, mobile_billing_type, public_billing_type,
              date_added, date_modified,  added_by, modified_by, rate_type ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 
                $10, $11, $12, $13, $14, $15, $16 ,$17, $18  ) returning customer_code`;

      const value = [data.customer_code, data.serv_name, data.fixed_rate, data.mobile_rate,
      data.public_rate, data.ips_fixed_rate, data.ips_mobile_rate, data.ips_public_rate, data.start_date, data.end_date,
      data.fixed_billing_type, data.mobile_billing_type, data.public_billing_type, data.date_added, 'now()', data.added_by,
      data.modified_by, data.rate_type];
      const res = await db.queryByokakin(query, value);

      if (data.fixed_rate) {
        updateData = 'fixed_rate=' + data.fixed_rate + ',';
      }
      if (data.mobile_rate) {
        updateData = updateData + 'mobile_rate=' + data.mobile_rate + ',';
      }

      if (data.public_rate) {
        updateData = updateData + 'public_rate=' + data.public_rate + ',';
      }

      if (data.ips_fixed_rate) {
        updateData = updateData + 'ips_fixed_rate=' + data.ips_fixed_rate + ',';
      }

      if (data.ips_mobile_rate) {
        updateData = updateData + 'ips_mobile_rate=' + data.ips_mobile_rate + ',';

      }

      if (data.ips_public_rate) {
        updateData = updateData + 'ips_public_rate=' + data.ips_public_rate + ',';
      }

      if (data.end_date) {
        updateData = updateData + 'end_date=' + `'${data.end_date}'` + ',';
      }

      if (data.fixed_billing_type) {
        updateData = updateData + 'fixed_billing_type=' + data.fixed_billing_type + ',';
      }
      if (data.mobile_billing_type) {
        updateData = updateData + 'mobile_billing_type=' + data.mobile_billing_type + ',';
      }
      if (data.public_billing_type) {
        updateData = updateData + 'public_billing_type=' + data.public_billing_type + ',';
      }

      if (data.modified_by) {
        updateData = updateData + 'modified_by=' + `'${data.modified_by}'` + ',';
      }

      updateData = updateData + 'date_modified= now()';

      const queryUpdate = `update ntt_kddi_rate set ${updateData} where  id='${data.id}'`;
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
