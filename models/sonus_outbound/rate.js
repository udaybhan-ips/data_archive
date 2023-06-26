var db = require('./../../config/database');
var utility = require('../../public/javascripts/utility')

module.exports = {
  findAll: async function () {
    try {
      const query = `select * from sonus_outbound_rates where deleted=false `;
      const rateListRes = await db.query(query, [], ipsPortal = true);

      const approvalDetailsQuery = `select * from byokakin_rate_approval_status where (step1_status ='pending' OR  step2_status ='pending' ) and carrier='SonusOutbound'` ;

      const approvalDetailsQueryRes = await db.queryByokakin(approvalDetailsQuery, []);



      let res = []

      res = rateListRes.rows.map((obj)=>{
        const ind = approvalDetailsQueryRes.rows.findIndex((ele)=> (obj.customer_id==ele.customer_cd ? true : false))

        if(ind!== -1) {
          return {...obj, ...approvalDetailsQueryRes.rows[ind]}
        }else{
          return {...obj}
        }
      })


      return res;
    } catch (error) {
      return error;
    }
  },
  getAllSonusRates: async function () {
    try {
      const query = "select * from sonus_outbound_rates where deleted=false";
      const rateListRes = await db.query(query, [], ipsPortal = true);
      const approvalDetailsQuery = `select * from byokakin_rate_approval_status where (step1_status ='pending' OR  step2_status ='pending' ) and carrier='SonusOutbound'` ;

      const approvalDetailsQueryRes = await db.queryByokakin(approvalDetailsQuery, []);

      let res = []

      res = rateListRes.rows.map((obj)=>{
        const ind = approvalDetailsQueryRes.rows.findIndex((ele)=> (obj.customer_id==ele.customer_cd ? true : false))

        if(ind!== -1) {
          return {...obj, ...approvalDetailsQueryRes.rows[ind]}
        }else{
          return {...obj}
        }
      })




      return res;
    } catch (error) {
      return error;
    }
  },
  create: async function (data) {
    console.log(data);
    try {
      //  if(validateRateData()){
      const query = `INSERT INTO sonus_outbound_rates (customer_id, landline, mobile, date_added ) VALUES ($1, $2, $3) returning rate_id`;
      const value = [data.customer_id, data.landline, data.mobile, 'now()'];
      const res = await db.query(query, value, ipsPortal = true);
      return res.rows[0];
      //  }
    } catch (error) {
      return error;
    }
  },
  updateRates: async function (data) {
    console.log("data..." + JSON.stringify(data));
    let updateData = '';
    try {
      //  if(validateRateData()){
      if (!data.customer_cd) {
        throw new Error("customer code is blank")
      }

      const checkRatesQuery = `select * from sonus_outbound_rates where customer_id='${data.customer_cd}' and deleted =false`;
      const checkRatesRes = await db.query(checkRatesQuery, [], true)

      if (checkRatesRes && checkRatesRes.rows && checkRatesRes.rows.length <= 0) {

        const insertNewRateQuery = `INSERT INTO sonus_outbound_rates (customer_id, landline, mobile, date_added ,updated_by , 
        trunkport, incallednumber, start_date, end_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning customer_id`;
        const value = [data.customer_cd, data.landline, data.mobile, 'now()', data.updated_by, data.trunkport, 
        data.incallednumber, data.start_date, data.end_date];
        const res = await db.query(insertNewRateQuery, value, ipsPortal = true);

        if (res && res.rows) {
          return 'data inserted'
        }
        throw new Error("Error while instering new rates data.." + res);
      }


      if (data.landline) {
        updateData = `landline='${data.landline}' ,`;
      }
      if (data.mobile) {
        updateData = updateData + `mobile= '${data.mobile}',`;
      }

      if (data.trunkport) {
        updateData = updateData + `trunkport= '${data.trunkport}',`;
      }

      if (data.incallednumber) {
        updateData = updateData + `incallednumber= '${data.incallednumber}',`;
      }
      if (data.start_date) {
        updateData = updateData + `start_date= '${data.start_date}',`;
      }
      if (data.end_date) {
        updateData = updateData + `end_date= '${data.end_date}',`;
      }

      updateData = updateData + `updated_by= '${data.updated_by}', updated_date= 'now()'`;

      const query = `INSERT INTO sonus_outbound_rates_history (customer_id, landline, mobile, date_added ,updated_by , trunkport, incallednumber, start_date, end_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning customer_id`;
      const value = [data.customer_cd, checkRatesRes.rows[0].landline, checkRatesRes.rows[0].mobile, 'now()', checkRatesRes.rows[0].updated_by, checkRatesRes.rows[0].trunkport, checkRatesRes.rows[0].incallednumber, checkRatesRes.rows[0].start_date, checkRatesRes.rows[0].end_date];
      const res = await db.query(query, value, ipsPortal = true);

      //console.log("res==");
      //console.log(res);

      const queryUpdate = `update sonus_outbound_rates set ${updateData} where customer_id = '${data.customer_cd}'`;
      const resUpdate = await db.query(queryUpdate, [], ipsPortal = true);


      await checkApprovalStatus(data, 'SonusOutbound') ;

      if (resUpdate && resUpdate.rows) {
        return resUpdate.rows[0];
      }
      throw new Error("Error while update sonus outbound rates.." + resUpdate)
      //  }
    } catch (error) {

      throw new Error("Error while update sonus outbound rates.." + error.message)
    }
  },

}

function validateUserData(data) {
  return new Promise(function (resolve, reject) {
    if (!data.password || !data.email) {
      reject('email and/or password missing')
    }
    else {
      validatePassword(data.password, 6)
        .then(function () {
          return validateEmail(data.email);
        })
        .then(function () {
          resolve();
        })
        .catch(function (err) {
          reject(err);
        });
    }
  });
}

function validateEmail(email) {
  return new Promise(function (resolve, reject) {
    if (typeof (email) !== 'string') {
      reject('email must be a string');
    }
    else {
      var re = new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
      if (re.test(email)) {
        resolve();
      }
      else {
        reject('provided email does not match proper email format');
      }
    }
  });
}

function validatePassword(password, minCharacters) {
  return new Promise(function (resolve, reject) {
    if (typeof (password) !== 'string') {
      reject('password must be a string');
    }
    else if (password.length < minCharacters) {
      reject('password must be at least ' + minCharacters + ' characters long');
    }
    else {
      resolve();
    }
  });
}

function verifyPassword(password, user) {
  return new Promise(function (resolve, reject) {
    bcrypt.compare(password, user.password, function (err, result) {
      if (err) {
        reject(err);
      }
      else {
        resolve({ isValid: result, id: user.id });
      }
    });
  });
}


async function checkApprovalStatus(data, carrier) {

  const checkApprovalStatus = `select * from byokakin_rate_approval_status where customer_cd ='${data.customer_cd}' and carrier ='${carrier}' ` ;
  const checkApprovalStatusRes  = await db.queryByokakin(checkApprovalStatus, []);

  if(checkApprovalStatusRes && checkApprovalStatusRes.rows && checkApprovalStatusRes.rows.length>0 ){

    const addHistory = `insert into byokakin_rate_approval_status_history 
    (customer_cd, added_by, added_date, step1_status, step1_approver, step1_approved_time, step2_status,
     step2_approver, step2_approved_time, comment_1, comment_2, carrier) select customer_cd, added_by, 
     added_date, step1_status, step1_approver, step1_approved_time, step2_status, step2_approver, 
     step2_approved_time, comment_1, comment_2, carrier from byokakin_rate_approval_status 
     where customer_cd ='${data.customer_cd}' and carrier ='${carrier}' ` ; 

     const addHistoryRes = await db.queryByokakin(addHistory, []);

    const updateApprovalStatus = `update byokakin_rate_approval_status set step1_status='pending' , added_date=now(), 
    added_by='${data.modified_by}' where customer_cd ='${data.customer_cd}' and carrier ='${carrier}' `



    const updateApprovalStatusRes = await db.queryByokakin(updateApprovalStatus, []);

  }else{
    const approvalInsertQuery = `insert into byokakin_rate_approval_status
     (customer_cd, added_by, added_date, step1_status, step1_approver, 
      step1_approved_time, step2_status, step2_approver, step2_approved_time, comment_1, comment_2, carrier) VALUES 
      ('${data.customer_cd}','${data.modified_by}',now(), 'pending' ,'', null, '','',null,'','','${carrier}' ) ` ;

    const approvalRes = await db.queryByokakin(approvalInsertQuery, []);
  }

  const subject =`Change Request in Byokakin ${carrier} Rate : ${data.customer_cd}` ;


  const html = `Hi Team
  <br>
  There is change Request in Byokakin ${carrier} Rate for below company : ${data.customer_cd} 
  <br>
  Requested by: ${data.modified_by}
  <br>
  URL : http://billing.toadm.com/company
  Thank you
  `;


  const mailOption = {
    from: 'ips_tech@sysmail.ipsism.co.jp',
    to: 'uday@ipsism.co.jp',
    //cc: 'y_ito@ipsism.co.jp',
    //     cc:'gaurav@ipsism.co.jp,abhilash@ipsism.co.jp,vijay@ipsism.co.jp',
    subject,
    html
  }
  utility.sendEmail(mailOption);

}