var config = require('./../../config/config');
var db = require('./../../config/database');
var utility = require('../../public/javascripts/utility')

module.exports = {
  findAll: async function() {
      try {
          const query=`SELECT * FROM cdr_sonus_rate order by rate_id asc `;
          const rateListRes= await db.query(query,[]);

          const approvalData = `select * from sonus_rate_approval_status` ;

          const approvalDataRes = await db.query(approvalData, [], true);

          const res = rateListRes.rows.map((obj)=>{
            const ind = approvalDataRes.rows.findIndex((ele)=>( (obj.rate_id==ele.rate_id && ele.service_type=='LEAFNET') ? true : false ))
            if(ind !== -1 ){
              return {...obj, ...approvalDataRes.rows[ind]}
            }else{
              return {...obj}
            }
          })

          return res;
      } catch (error) {
          return error;
      }
  },

  create: async function(data) {
    console.log(data);
    try {
      //  if(validateRateData()){
            const query=`INSERT INTO cdr_sonus_rate (company_code, carrier_code, carrier_name, call_sort, 
                date_start, date_expired, rate_setup, rate_second, date_updated, currnet_flag,updated_by  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning rate_id`;
            const value= [data.company_code, data.carrier_code, data.carrier_name, data.call_sort, 
                data.date_start, data.date_expired, data.rate_setup, data.rate_second, 'now()', data.current_flag, data.updated_by];
            const res = await db.query(query,value);
            return res.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },
  updateRates: async function(data) {
    console.log("req data.."+JSON.stringify(data));
    //{"rate_id":1,"company_code":"00000130","carrier_code":"null","carrier_name":"null","call_sort":"null","date_start":"2020-09-01 00:00:00",
    //"date_expired":"9999-12-31 00:00:00","rate_setup":"0.251","rate_second":"0.005","date_updated":"2020-09-30 10:22:00","currnet_flag":1,
    //"date_added":"2021-06-07 11:11:39.846408","updated_by":"d_operator@gmail.com"}

    let updateData='';
    try {
     
            const query=`INSERT INTO cdr_sonus_rate_history (company_code, carrier_code, carrier_name, call_sort, 
                date_start, date_expired, rate_setup, rate_second, date_updated, currnet_flag ,rate_id, updated_by) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11, $12) returning rate_id`;
            const value= [data.company_code, data.carrier_code, data.carrier_name, data.call_sort, 
                data.date_start, data.date_expired, data.rate_setup, data.rate_second, 'now()', data.current_flag, data.rate_id, data.updated_by];
            const res = await db.query(query,value);

            if(data.rate_setup){
              updateData = updateData + 'rate_setup='+data.rate_setup+',';
            }

            if(data.rate_second){
              updateData = updateData+ 'rate_second='+data.rate_second+',';
            }

            if(data.updated_by){
              updateData = updateData+ `updated_by = '${data.updated_by}'`;
            }

           
            const queryUpdate= `update cdr_sonus_rate set ${updateData} where  rate_id='${data.rate_id}'`;
            const resUpdate = await db.query(queryUpdate,[]);
            await checkApprovalStatus(data, 'LEAFNET');
            return resUpdate.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },

  
}


async function checkApprovalStatus(data, service_type) {

  const checkApprovalStatus = `select * from sonus_rate_approval_status where rate_id ='${data.rate_id}' and service_type ='${service_type}' ` ;
  const checkApprovalStatusRes  = await db.query(checkApprovalStatus, [], true);

  if(checkApprovalStatusRes && checkApprovalStatusRes.rows && checkApprovalStatusRes.rows.length>0 ){

    const addHistory = `insert into sonus_rate_approval_status_history 
    (service_type, customer_cd, added_by, added_date, step1_status, step1_approver, step1_approved_time, step2_status,
     step2_approver, step2_approved_time, comment_1, comment_2, rate_id) select service_type,customer_cd, added_by, 
     added_date, step1_status, step1_approver, step1_approved_time, step2_status, step2_approver, 
     step2_approved_time, comment_1, comment_2, rate_id from sonus_rate_approval_status 
     where rate_id ='${data.rate_id}' and service_type ='${service_type}' ` ; 

     const addHistoryRes = await db.query(addHistory, [], true);

    const updateApprovalStatus = `update sonus_rate_approval_status set step1_status='pending' , added_date=now(), 
    added_by='${data.updated_by}' where rate_id ='${data.rate_id}' and service_type ='${service_type}' `

    const updateApprovalStatusRes = await db.query(updateApprovalStatus, [], true);

  }else{
    const approvalInsertQuery = `insert into sonus_rate_approval_status
     (service_type, customer_cd, added_by, added_date, step1_status, step1_approver, 
      step1_approved_time, step2_status, step2_approver, step2_approved_time, comment_1, comment_2, rate_id) VALUES 
      ('${service_type}','${data.customer_cd}','${data.updated_by}',now(), 'pending' ,'', null, '','',null,'','','${data.rate_id}' ) ` ;

    const approvalRes = await db.query(approvalInsertQuery, [], true);
  }

  try{
    const subject =`Change Request in ${service_type} of the Rate in ${data.carrier_code} of ${data.carrier_name}` ;


    const html = `Hi Team
    <br>
    Change Request in ${service_type} of the Rate in ${data.carrier_code} of ${data.carrier_name}
    <br>
    Requested by: ${data.updated_by}
    <br>
    URL : http://billing.toadm.com/services/leafnet/rate
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
  }catch(err){
    console.log("Error is .."+err.message);
  }
  

}