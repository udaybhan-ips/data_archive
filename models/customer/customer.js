var config = require('./../../config/config');
var db = require('./../../config/database');
var KDDIRate = require('../byokakin/kddi/rate');
var NTTRate = require('../byokakin/ntt/rate');
const utility = require('../../public/javascripts/utility')

module.exports = {
  findAll: async function () {
    try {

      const query = `select id, customer_cd, customer_name, post_number, email, tel_number,upd_id,fax_number,  
      upd_date, address, staff_name, commission, eli, ameyo_license,
      service_type ->> 'kddi_customer' as kddi_customer,  service_type ->> 'ntt_customer' as ntt_customer, 
      service_type ->> 'ntt_orix_customer' as ntt_orix_customer, service_type  from  m_customer 
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

  getUpdateApprovalHistory: async function (data) {
    try {

      //console.log(JSON.stringify(data))

      if (!data || !data.customer_cd) {
        throw new Error('invalid data');
      }
      const query = `select * from byokakin_rate_approval_status_history where customer_cd='${data.customer_cd}' order by id desc`;

      const approvalHistory = await db.queryByokakin(query, []);
      if (approvalHistory && approvalHistory.rows) {
        return approvalHistory.rows;
      }
      else {
        throw new Error(approvalHistory)
      }

    } catch (error) {
      throw new Error(error.message);
    }
  },


  getCustomerHistory: async function (data) {
    try {

      console.log(JSON.stringify(data))

      let where = "";

      if (data && data.customer_cd != undefined) {
        where = `where customer_cd='${data.customer_cd}'`;
      }
      const query = `select customer_cd, customer_name, address, tel_number, email, staff_name, upd_id, upd_date, post_number, 
      fax_number from  m_customer_history ${where}  order by id desc`;

      const customerHistory = await db.query(query, [], true);
      if (customerHistory && customerHistory.rows) {
        return customerHistory.rows;
      }
      else {
        throw new Error(customerHistory)
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

      let getLastCustomerCodeQuery = `SELECT customer_cd FROM m_customer order by customer_cd desc limit 1`;
      let getLastCustomerCodeRes = await db.query(getLastCustomerCodeQuery, [], true);

      if (getLastCustomerCodeRes.rows.length <= 0) {
        throw new Error('Error while genrateing customer code');
      }

      let customer_cd = getLastCustomerCodeRes.rows[0]['customer_cd'];
      customer_cd = parseInt(customer_cd, 10) + 1;
      customer_cd = customer_cd.toString().padStart(8, '0');


      const query = `INSERT INTO m_customer (customer_cd, customer_name, address, tel_number, email, staff_name, 
      logo, upd_id, upd_date, post_number, fax_number, pay_type, service_type, commission ) VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14 ) returning customer_cd`;

      const value = [customer_cd, data.customer_name, data.address, data.tel_number,
        data.email, data.staff_name, data.logo, data.upd_id, 'now()', data.post_number,
        data.fax_number, data.pay_type, JSON.stringify(data.service_type), data.commission];
      const res = await db.query(query, value, true);

      if (res.rows) {
        if (data.service_type && data.service_type.kddi_customer && data.service_type.kddi_customer == true) {
          const rateData = { ...data.kddi_customer, customer_cd, serv_name: 'KDDI' };
          const res = await KDDIRate.create(rateData);
          if (res && res.length <= 0) {
            throw new Error(res);
          }
        }
        if (data.service_type && data.service_type.ntt_customer && data.service_type.ntt_customer == true) {
          const rateData = { ...data.ntt_customer, customer_cd, serv_name: 'NTT' };
          const res = await NTTRate.create(rateData);
          if (res && res.length <= 0) {
            throw new Error(res);
          }
        }
        return { 'res': 'insert success' };
      }
      else
        throw new Error(res);
      //  }
    } catch (error) {
      throw new Error(error);
    }
  },



  updateByokiakinRateApproval: async function (data) {

    console.log("data ..." + JSON.stringify(data))
    //{"step2_status":"reject","customer_cd":"00001280","comments2":"reject","modified_by":"approver@gmail.com","step":"2","typeOfCompany":["sonus_outbound"]}

    try {

      if (data.customer_cd === undefined || data.customer_cd === null) {
        throw new Error('Invalid Request')
      }

      const {typeOfCompany} = data ;

      let sonusOutbound = false ,  byokakin = false;

      sonusOutbound = typeOfCompany.filter((ele)=>(ele == 'sonus_outbound' ? true : false))
      byokakin = typeOfCompany.filter((ele)=>((ele == 'kddi_customer' || ele == 'ntt_customer' ) ? true : false))

      if (data && data.step && data.step !== '2') {


        let updateStep2 = "", subject = '', html = "";

        if (data.step1_status === 'approve') {
          updateStep2 = `, step2_status='pending'`;

          subject = `Change Request in Byokakin Rate Step 2 : ${data.customer_cd}`;
          html = `Hi 
          <br> 
          There is change Request in Byokakin Rate for step 2 below company : ${data.customer_cd} 
          <br>
          Comments : ${data.comments1}
          <br>
          Approved By: ${data.modified_by}
          <br>
          Thank you
        `;


        } else if (data.step1_status === 'reject') {

          /*** reverse the last changes!! */
         await reverseLastChanges(data, sonusOutbound, byokakin);

          subject = `Change Request in Byokakin Rate Step 1 : ${data.customer_cd} is Rejected`;
          html = `Hi 
          <br>
          There is change Request in Byokakin Rate for step 1 below company : ${data.customer_cd} has been rejected by ${data.modified_by} 
          <br>
           and reason is ${data.comments1}
          <br>
          Note: Request is rejected so we are going to update the original data. Please check.
          <br>
          Thank you
        `;
        }

        const mailOption = {
          from: 'ips_tech@sysmail.ipsism.co.jp',
          to: 'uday@ipspro.co.jp',
          // cc: 'y_ito@ipsism.co.jp',
          subject,
          html
        }
        utility.sendEmail(mailOption);

        const addHistory = `insert into byokakin_rate_approval_status_history 
        (customer_cd, added_by, added_date, step1_status, step1_approver, step1_approved_time, step2_status,
         step2_approver, step2_approved_time, comment_1, comment_2, carrier) select customer_cd, added_by, 
         added_date, step1_status, step1_approver, step1_approved_time, step2_status, step2_approver, 
         step2_approved_time, comment_1, comment_2, carrier from byokakin_rate_approval_status where customer_cd ='${data.customer_cd}' `;

        const addHistoryRes = await db.queryByokakin(addHistory, []);

        const updateStatusStep1 = `update byokakin_rate_approval_status set step1_status ='${data.step1_status}', 
          step1_approver='${data.modified_by}', step1_approved_time=now(),comment_1='${data.comments1}' ${updateStep2}
          where customer_cd='${data.customer_cd}'`;

        const res = await db.queryByokakin(updateStatusStep1, []);

        return res;

      } else {

        if (data.step2_status === 'approve') {

          subject = `Approve !!!  Change Request in Byokakin Rate Step 2 of : ${data.customer_cd}`;
          html = `Hi 
          <br>
        There is change Request in Byokakin Rate for step 2 below company : ${data.customer_cd} has been finished.
        <br>
        Comment: ${data.comments1}
        <br>
        Approve By: ${data.modified_by}
        <br>
        Thank you
        `;


        } else if (data.step2_status === 'reject') {

          /*** reverse the last changes!! */

         await reverseLastChanges(data, sonusOutbound, byokakin);

          subject = `Change Request in Byokakin Rate Step 2 : ${data.customer_cd} is Rejected`;
          html = `Hi 
          <br> 
        There is change Request in Byokakin Rate for step 2 below company : ${data.customer_cd} has been rejected by ${data.modified_by} 
        and reason is ${data.comments1}
        <br>
        Note: Request is rejected so we are going to update the original data. Please check.
        <br>
        Thank you
        `;
        }


        const mailOption = {
          from: 'ips_tech@sysmail.ipsism.co.jp',
          to: 'uday@ipspro.co.jp',
          // cc: 'y_ito@ipsism.co.jp',
          subject,
          html
        }
        utility.sendEmail(mailOption);

        const addHistory = `insert into byokakin_rate_approval_status_history 
        (customer_cd, added_by, added_date, step1_status, step1_approver, step1_approved_time, step2_status,
         step2_approver, step2_approved_time, comment_1, comment_2, carrier) select customer_cd, added_by, 
         added_date, step1_status, step1_approver, step1_approved_time, step2_status, step2_approver, 
         step2_approved_time, comment_1, comment_2, carrier from byokakin_rate_approval_status where customer_cd ='${data.customer_cd}' `;

        const addHistoryRes = await db.queryByokakin(addHistory, []);

        const updateStatusStep2 = `update byokakin_rate_approval_status set step2_status ='${data.step2_status}', 
          step2_approver='${data.modified_by}', step2_approved_time=now(),comment_2='${data.comments2}' 
          where customer_cd='${data.customer_cd}'`;

        const res = await db.queryByokakin(updateStatusStep2, []);
        return res;

      }
    } catch (error) {
      console.log("Error..." + error.message)
      throw new Error("Error !" + error.message)
    }

  },



  updateCustomerInfo: async function (data) {
    console.log("data" + JSON.stringify(data));
    let updateData = '';
    try {
      const query = `INSERT INTO m_customer_history (customer_cd, customer_name, address, tel_number, email, staff_name, 
      logo, upd_id, upd_date, post_number, fax_number, pay_type, is_deleted, service_type, eli, ameyo_license ) VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16 ) returning customer_cd`;

      const value = [data.customer_cd, data.customer_name, data.address, data.tel_number,
      data.email, data.staff_name, data.logo, data.upd_id, 'now()', data.post_number,
      data.fax_number, data.pay_type, data.is_deleted, JSON.stringify(data.service_type), data.eli, data.ameyo_license];

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


      updateData = updateData + `upd_date= now(), commission=${data.commission} , eli=${data.eli}, ameyo_license=${data.ameyo_license} , upd_id= '${data.updated_by}' `;

      const queryUpdate = `update m_customer set ${updateData} where  id='${data.id}'`;

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


async function reverseLastChanges(data, sonusOutbound, byokakin) {

  if(sonusOutbound==true ){
    const queryGetPrevValue = `select * from sonus_outbound_rates_history where  customer_id='${data.customer_cd}' order by id desc limit 2` ;
    const queryGetPrevValueRes = await db.query(queryGetPrevValue, [], true);
    if (queryGetPrevValueRes && queryGetPrevValueRes.rows && queryGetPrevValueRes.rows.length >= 2) {

      const queryUpdatePrevValue = `update sonus_outbound_rates set landline='${queryGetPrevValueRes.rows[1].landline}', 
      mobile='${queryGetPrevValueRes.rows[1].mobile}',trunkport='${queryGetPrevValueRes.rows[1].trunkport}', 
      incallednumber='${queryGetPrevValueRes.rows[1].incallednumber}', start_date='${queryGetPrevValueRes.rows[1].start_date}', 
      end_date='${queryGetPrevValueRes.rows[1].end_date}' where customer_id='${data.customer_cd}' `;

      const queryUpdatePrevValueRes = await db.query(queryUpdatePrevValue, [], true);

    }


  }else if(byokakin==true) {

  const queryGetPrevValue = `select * from ntt_kddi_rate_c_history where customer_code='${data.customer_cd}' order by id desc limit 2`;
  const queryGetPrevValueRes = await db.queryByokakin(queryGetPrevValue, []);

  if (queryGetPrevValueRes && queryGetPrevValueRes.rows && queryGetPrevValueRes.rows.length >= 2) {

    const queryUpdatePrevRates = `update ntt_kddi_rate_c set fixed_rate='${JSON.stringify(queryGetPrevValueRes.rows[1].fixed_rate)}', 
    mobile_rate='${JSON.stringify(queryGetPrevValueRes.rows[1].mobile_rate)}', public_rate='${JSON.stringify(queryGetPrevValueRes.rows[1].public_rate)}', 
    navi_dial_rate='${JSON.stringify(queryGetPrevValueRes.rows[1].navi_dial_rate)}', sonota_rate='${JSON.stringify(queryGetPrevValueRes.rows[1].sonota_rate)}', 
    modified_by='${queryGetPrevValueRes.rows[1].modified_by}', start_date='${queryGetPrevValueRes.rows[1].start_date}',
    end_date='${queryGetPrevValueRes.rows[1].end_date}' where customer_code='${data.customer_cd}'  `;

    const queryUpdatePrevRatesRes = await db.queryByokakin(queryUpdatePrevRates, []);

  }
  }


}