var config = require('./../../config/config');
var db = require('./../../config/database');
var KDDIRate = require('../byokakin/kddi/rate');
var NTTRate = require('../byokakin/ntt/rate');

module.exports = {
  findAll: async function () {
    try {

      const query = `select id, customer_cd, customer_name, post_number, email, tel_number,upd_id, upd_date, address, staff_name, 
      service_type ->> 'kddi_customer' as kddi_customer,  service_type ->> 'ntt_customer' as ntt_customer, 
      service_type ->> 'ntt_orix_customer' as ntt_orix_customer, service_type  from  m_customer_tmp 
      where is_deleted=false order by customer_cd desc`;

      const companyList = await db.query(query, [], true);
      if (companyList && companyList.rows) {
        return companyList.rows;
      }
      else {
        throw new Error(companyList)
      }

    } catch (error) {
      throw new Error(error.message);
    }
  },

  create: async function (data) {
    console.log("data is " + JSON.stringify(data));
    try {

      if (!data || !data.customer_name) {
        throw new Error('invalid data');
      }

      let getLastCustomerCodeQuery = `SELECT customer_cd FROM m_customer_tmp order by customer_cd desc limit 1`;
      let getLastCustomerCodeRes = await db.query(getLastCustomerCodeQuery, [], true);

      if (getLastCustomerCodeRes.rows.length <= 0) {
        throw new Error('Error while genrateing customer code');
      }

      let customer_cd = getLastCustomerCodeRes.rows[0]['customer_cd'];
      customer_cd = parseInt(customer_cd, 10) + 1;
      customer_cd = customer_cd.toString().padStart(8, '0');


      const query = `INSERT INTO m_customer_tmp (customer_cd, customer_name, address, tel_number, email, staff_name, 
        logo, upd_id, upd_date, post_number, fax_number, pay_type, 
         service_type ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 
                $10, $11, $12, $13 ) returning customer_cd`;
      const value = [customer_cd, data.customer_name, data.address, data.tel_number,
        data.email, data.staff_name, data.logo, data.upd_id, 'now()', data.post_number,
        data.fax_number, data.pay_type, JSON.stringify(data.service_type)];
      const res = await db.query(query, value, true);
      if (res.rows) {
        if (data.service_type && data.service_type.kddi_customer && data.service_type.kddi_customer == true) {
          const rateData = { ...data.kddi_customer, customer_cd, serv_name: 'KDDI' };
          const res = await KDDIRate.create(rateData);
          if (res && res.length <=0) {
            throw new Error(res);
          }
        }
        if (data.service_type && data.service_type.ntt_customer && data.service_type.ntt_customer == true) {
          const rateData = { ...data.ntt_customer, customer_cd, serv_name: 'NTT' };
          const res = await NTTRate.create(rateData);
          if (res && res.length <=0) {
            throw new Error(res);
          }
        }
        return {'res':'insert success'};
      }
      else
        throw new Error(res);
      //  }
    } catch (error) {
      throw new Error(error);
    }
  },

  updateCustomerInfo: async function (data) {
    console.log(data);
    let updateData = '';
    try {
      const query = `INSERT INTO m_customer_history (customer_cd, customer_name, address, tel_number, email, staff_name, 
        logo, upd_id, upd_date, post_number, fax_number, pay_type, 
        is_deleted, service_type ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 
                $10, $11, $12, $13, $14, $15 ) returning customer_cd`;

      const value = [data.customer_cd, data.customer_name, data.address, data.tel_number,
      data.email, data.staff_name, data.logo, data.upd_id, 'now()', data.post_number,
      data.fax_number, data.pay_type, data.is_deleted, JSON.stringify(data.service_type)];

      const res = await db.query(query, value, true);

      if (data.customer_name) {
        updateData = `customer_name= '${data.customer_name}',`;
      }
      if (data.address) {
        updateData = updateData + `address= '${data.address}',`;
      }

      if (data.tel_number) {
        updateData = updateData + `tel_number= '${data.tel_number}',`;
      }

      if (data.email) {
        updateData = updateData + `email= '${data.email}',`;
      }

      if (data.staff_name) {
        updateData = updateData + `staff_name= '${data.staff_name}',`;

      }

      if (data.upd_id) {
        updateData = updateData + `upd_id= '${data.upd_id}',`;
      }

      if (data.post_number) {
        updateData = updateData + `post_number= '${data.post_number}',`;
      }

      if (data.fax_number) {
        updateData = updateData + `fax_number= '${data.fax_number}',`;
      }
      if (data.is_deleted) {
        updateData = updateData + 'is_deleted=' + data.is_deleted + ',';
      }
      if (data.service_type) {
        updateData = updateData + `service_type ='${JSON.stringify(data.service_type)}',`;
      }

      updateData = updateData + 'upd_date= now()';

      const queryUpdate = `update m_customer_tmp set ${updateData} where  id='${data.id}'`;

      console.log("queryUpdate..." + queryUpdate)

      const resUpdate = await db.query(queryUpdate, [], true);
      if (resUpdate.rows)
        return resUpdate.rows[0];
      else
        throw new Error(resUpdate);
      //  }
    } catch (error) {
      throw new Error(error);

    }
  },
  listUsers: async function () {
    try {
      let query = `select id, name, email_id from users order by email_id`;
      let res = await db.query(query, [], true);

      if (res && res.rows && res.rows.length > 0) {
        return res.rows;
      }
      throw new Error(res);
    } catch (error) {
      console.log("Error in getting user list..." + error.message);
      throw new Error(error.message);
    }
  },

}
