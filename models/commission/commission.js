var db = require('../../config/database');
var utility = require('./../../public/javascripts/utility');

module.exports = {

  onApproveRowData: async function (data) {
    console.log("data..." + JSON.stringify(data))
    
    try {

      if(data && data.agent_code!=='' && data.agent_code!==undefined){
        const checkQuery = `select * from agent_commission_approve_status where customer_id='${data.agent_code}' and billing_period::date ='${data.bill_start}::date'  and deleted = false  ` ;
        let res = await db.queryByokakin(checkQuery, []) ;
        if(res && res.rows && res.rows.length > 0){
          throw new Error('Record already exist!');
        }

      }else{
        throw new Error('Invalid data!')
      }


      const query = `insert into agent_commission_approve_status  (customer_id, status, billing_period, added_by , date_added, updated_by, updated_date) 
      values ('${data.agent_code}','${data.status}','${data.bill_start}','${data.approvedBy}',now(),'${data.approvedBy}',now())`;

      const getCommissionEmailDetails = `select * from agent_commission_config where agent_id ='${data.agent_code}' and deleted =false limit 1` ; 

      let getCommissionEmailDetailsRes = await db.queryByokakin(getCommissionEmailDetails, []);

      if(getCommissionEmailDetailsRes && getCommissionEmailDetailsRes.rows.length> 0){

        let dateTime = new Date(data.bill_start);
        year = dateTime.getFullYear();
        month = dateTime.getMonth()+1;

        let emailContents = getCommissionEmailDetailsRes.rows[0]['email_content'];
        let emailSubject = getCommissionEmailDetailsRes.rows[0]['email_subject'];
        emailContents = emailContents.replace(/YYYY/g,year) ;
        emailContents = emailContents.replace(/MM/g,month) ;

        emailSubject = emailSubject.replace(/YYYY/g,year) ;
        emailSubject = emailSubject.replace(/MM/g,month) ;

        let emailTo = "uday@ipspro.co.jp";
        let emailCC = "uday@ipspro.co.jp";
        let emailBCC = "uday@ipspro.co.jp";

        const emailScheduleQuery = `insert into agent_commission_email_history (customer_id, email_status, billing_month, email_contents, email_to,
          email_cc, email_bcc, status, added_by, date_added, email_subject) values ('${data.agent_code}','pending','${data.bill_start}','${emailContents}','${emailTo}',
          '${emailCC}', '${emailBCC}', '${data.status}','${data.approvedBy}', now(), '${emailSubject}') `;

          const emailScheduleQueryRes = await db.queryByokakin(emailScheduleQuery, []);
  
      }

      
      
      //  console.log("query.."+query)

      const deleteRes = await db.queryByokakin(query, []);
      

      if (deleteRes ) {
        return (deleteRes);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in status update commission data !" + error.message)
      throw new Error(error.message)
    }
  },

  getTargetDate: async function (date_id) {
    try {
      const query = `SELECT max(date_set)::date as target_billing_month, max(date_set)::date as current_montth FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
      const targetDateRes = await db.query(query, []);

      if (targetDateRes.rows) {
        return { 'target_billing_month': (targetDateRes.rows[0].target_billing_month), 'current_montth': (targetDateRes.rows[0].current_montth) };
      }
      return { err: 'not found' };
    } catch (error) {
      return error;
    }
  },


  getAllCommissionCustomer: async function (customerId) {
    try {

      let WHERE = "";

      if(customerId){
        WHERE = `where customer_cd = '${customerId}' and is_deleted = false `
      }else{
        WHERE = `where is_deleted = false `
      }

      let customerList = []

      const getAllCustomerList = `select id, customer_cd, customer_name, commission from m_customer ${WHERE} limit 3` ; 
      const getAllCustomerListRes = await db.query(getAllCustomerList, [], true);

      const getAllAgentList = `select agent_code from agent_incentive where edat_fini::date > now() and deleted=false  ` ; 
      const getAllAgentListRes = await db.queryByokakin(getAllAgentList, []);
      
      if(getAllCustomerListRes && getAllCustomerListRes.rows && getAllCustomerListRes.rows.length > 0 && getAllAgentListRes 
        && getAllAgentListRes.rows && getAllAgentListRes.rows.length>0 ) {

        customerList = getAllCustomerListRes.rows.filter((obj) => {
          let ind = -1
          ind = getAllAgentListRes.rows.findIndex((ele) => (ele.agent_code==obj.customer_cd));
          return ind === -1 ? false : true;      
        })
      }

      console.log("customer list=="+JSON.stringify(customerList))

      return customerList;
      
    } catch (error) {
      return error;
    }
  },


  getCommissionConfig: async function (data) {

    try {
      const query = `select * from agent_commission_config where deleted = false order by agent_id ` ;
      //  console.log("query.."+query)
      const getCommissionConfigRes = await db.queryByokakin(query, []);
      if (getCommissionConfigRes.rows) {
        return (getCommissionConfigRes.rows);
      }
      throw new Error('not found')
    } catch (error) {
      console.log("error in getting commission config !" + error.message)
      throw new Error(error.message)
    }
  },

  deleteCommissionConfig: async function (data) {
    console.log("data..." + JSON.stringify(data))    
    try {
      const query = `update agent_commission_config  set deleted=${data.deleted}, update_by='${data.edit_by}', 
      updated_date=now()  where id ='${data.id}' `;      
      //  console.log("query.."+query)
      const deleteRes = await db.queryByokakin(query, []);      
      if (deleteRes ) {
        return (deleteRes);
      }
      throw new Error('not found')
    } catch (error) {
      console.log("error in delete commission data !" + error.message)
      throw new Error(error.message)
    }
  },

  
  addCommissionConfig: async function (data) {

    //console.log("data..." + JSON.stringify(data))
    
    try {

      if(data && data.comp_code!==''){
        const checkQuery = `select * from agent_commission_config where agent_id='${data.comp_code}' and deleted = false  ` ;
        let res = await db.queryByokakin(checkQuery, []) ;
        if(res && res.rows && res.rows.length > 0){
          throw new Error('Record already exist!');
        }

      }else{
        throw new Error('Invalid data!')
      }


      const query = `insert into agent_commission_config  (agent_id, payment_due_date_mode, email_content, email_subject , email_to, email_cc, date_added,added_by) 
      values ('${data.comp_code}','${data.payment_plan_type}','${data.email_content}','${data.email_subject}','${data.email_to}','${data.email_cc}',now(),'${data.addedBy}')`;
      
      //  console.log("query.."+query)

      const deleteRes = await db.queryByokakin(query, []);
      

      if (deleteRes ) {
        return (deleteRes);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in delete commission data !" + error.message)
      throw new Error(error.message)
    }
  },
  
  updateCommissionConfig: async function (data) {

    console.log("data..." + JSON.stringify(data))
    let updateData = "", agentId = "";
    try {

      if(data.agent_id!==undefined && data.agent_id!==null && data.agent_id!=='' ){
          agentId = data.agent_id ;
      }else{
        throw new Error("Invalid request!");
      }


      if (data.payment_due_date_mode) {
        updateData = `payment_due_date_mode= '${data.payment_due_date_mode}',`;
      }
      if (data.email_content) {
        updateData = updateData + `email_content= '${data.email_content}',`;
      }
      if (data.email_to) {
        updateData = updateData + `email_to= '${data.email_to}',`;
      }

      
      if (data.email_subject) {
        updateData = updateData + `email_subject= '${data.email_subject}',`;
      }

      if (data.email_cc) {
        updateData = updateData + `email_cc= '${data.email_cc}',`;
      }
      
      updateData = updateData + `update_by= '${data.edit_by}',`;
      updateData = updateData + `updated_date= now()`;
    
      

      const query = `update agent_commission_config  set ${updateData} where agent_id ='${agentId}' `;
      

      //  console.log("query.."+query)

      const deleteRes = await db.queryByokakin(query, []);
      

      if (deleteRes ) {
        return (deleteRes);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in update commission config data !" + error.message)
      throw new Error(error.message)
    }
  },

  getCommissionInfo: async function (data) {

    try {
      const query = `select data_idno as id, agent_code, freedial_code as target_agent_code, serv_name, 
          call_sort as call_type, edat_star as start_date, edat_fini as end_date, amnt_conv as commission,
         edit_by, edit_date , amount from agent_incentive where edat_fini::date > now() and deleted=false 
         order by agent_code, target_agent_code` ;

      //  console.log("query.."+query)

      const summaryRes = await db.queryByokakin(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting commission info !" + error.message)
      throw new Error(error.message)
    }
  },
  deleteCommissionSummary: async function (data) {

    console.log("data..." + JSON.stringify(data))



    try {
      const query = `delete from agent_commission where bill_numb ='${data.bill_numb}' `;
      const queryDetail = `delete from agent_commission_details where bill_numb ='${data.bill_numb}' `;

      //  console.log("query.."+query)

      const deleteRes = await db.queryByokakin(query, []);
      const deleteDetatilRes = await db.queryByokakin(queryDetail, []);

      if (deleteRes && deleteDetatilRes) {
        return (deleteRes);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in delete commission data !" + error.message)
      throw new Error(error.message)
    }
  },

  getCommissionSummary: async function ({ year, month, comp_code }) {

    try {

      if (year == undefined || year == '' || year == null || month == undefined || month == '' || month == null) {
        throw new Error('Invalid Request!')
      }
      let where = `WHERE bill_start::date ='${year}-${month}-1' and bill_sum > 0`;
      if (comp_code != undefined && comp_code != '' && comp_code != null) {
        where += `AND agent_code='${comp_code}'`;
      }
      const query = `select * from  (select * from agent_commission ${where})as lj left join (select status, customer_id from agent_commission_approve_status 
        where billing_period::date ='${year}-${month}-1' ) as rj on (lj.agent_code = rj.customer_id) order by lj.agent_code `;

      console.log("query.."+query)
      const summaryRes = await db.queryByokakin(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting commission details !" + error.message)
      throw new Error(error.message)
    }
  },

  getCommissionDetails: async function ({ year, month, comp_code, carrier }) {

    try {

      if (year == undefined || year == '' || year == null || month == undefined || month == '' || month == null) {
        throw new Error('Invalid Request!')
      }

      let where = `WHERE bill_start::date ='${year}-${month}-1' and comm_amnt > 0 `;
      if (comp_code != undefined && comp_code != '' && comp_code != null) {
        where += `AND agent_code='${comp_code}'`;
      }
      if (carrier != undefined && carrier != '' && carrier != null) {
        where += `AND serv_name='${carrier}'`;
      }
      const query = `select data_idno as id, agent_code, freedial_code, bill_numb, serv_name, call_sort, 
      bill_start, bill_end, bill_amnt, amnt_conv, comm_amnt from agent_commission_details ${where} 
      order by freedial_code asc`;

      console.log("query.." + query)

      const summaryRes = await db.queryByokakin(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting commission details !" + error.message)
      throw new Error(error.message)
    }
  },

  deleteCommissionDetails: async function(comp_code, year, month){

    const deleteCommissionProcessedData = `delete from agent_commission where agent_code ='${comp_code}' and bill_start::date ='${year}-${month}-01' ` ;    
    const deleteCommissionProcessedData1 = `delete from agent_commission_details where agent_code ='${comp_code}' and bill_start::date ='${year}-${month}-01' ` ;    

    console.log("deleteCommissionProcessedData.."+deleteCommissionProcessedData);
    console.log("deleteCommissionProcessedData1.."+deleteCommissionProcessedData1);

    // const deleteCommissionProcessedDataRes = await db.queryByokakin(deleteCommissionProcessedData, []);
    // const deleteCommissionProcessedDataRes1 = await db.queryByokakin(deleteCommissionProcessedData1, []);

    return null;

  },

  createCommissionDetails: async function ({ comp_code, year, month, payment_plan_date, createdBy }) {

    let billNo = 1000;
    const getNumberOfDaysInMonth = utility.daysInMonth(month, year);

    console.log("getNumberOfDaysInMonth.." + getNumberOfDaysInMonth)

    try {

      if (comp_code == undefined || comp_code == '') {
        throw new Error('Invalid Request')
      }

      const query = ` select * from agent_incentive where agent_code='${comp_code}' and deleted=false and  
      edat_fini::date > now() order by freedial_code`;
      const targetAgentCode = await db.queryByokakin(query, []);

      const getBillNoQuery = `select max(bill_numb) as max_bill_no from agent_commission `;
      const billNoRes = await db.queryByokakin(getBillNoQuery, []);

      console.log("billNoRes.." + JSON.stringify(billNoRes))

      if (billNoRes.rows && billNoRes.rows.length > 0 && billNoRes.rows[0].max_bill_no !== null && billNoRes.rows[0].max_bill_no !== 'null') {
        billNo = parseInt(billNoRes.rows[0].max_bill_no, 10) + 1;
      }

      if (targetAgentCode && targetAgentCode.rows && targetAgentCode.rows.length > 0) {
        let res = [], subTotalCommissionAmt = 0, totalCommissionAmt = 0, taxCommissionAmt = 0;

        for (let i = 0; i < targetAgentCode.rows.length; i++) {
          if (parseInt(targetAgentCode.rows[i].amount, 10) > 0) {



            let callSort = targetAgentCode.rows[i].call_sort;

            if (targetAgentCode.rows[i].call_sort === 'LastMonthUsege') {
              const YYYYMM = utility.getPreviousYearMonth(`${year}-${month}-01`);
              callSort = `${YYYYMM.month}月利用分`;
            }


            const commissionAmt = parseInt(targetAgentCode.rows[i].amount, 10);
            const total_amount = 0;
            subTotalCommissionAmt += parseInt(commissionAmt, 10);

            console.log("subTotalCommissionAmt.."+subTotalCommissionAmt)


            const insertQuery = `insert into agent_commission_details (agent_code, freedial_code, bill_numb, serv_name, call_sort, 
              bill_start, bill_end, bill_amnt, amnt_conv, comm_amnt) VALUES ('${comp_code}','${targetAgentCode.rows[i].freedial_code}',
              '${billNo}','${targetAgentCode.rows[i].serv_name}','${callSort}','${year}-${month}-01',
              '${year}-${month}-${getNumberOfDaysInMonth}','0','0','${commissionAmt}')`;
            const insertRes = await db.queryByokakin(insertQuery, []);
            res.push(insertRes);
            if (res == 'data already there!') {
              throw new Error(res)
            }


          } else if (targetAgentCode.rows[i].serv_name == 'KDDI' || targetAgentCode.rows[i].serv_name == 'NTT') {

            let getCommissionData = "";

            if (targetAgentCode.rows[i].call_sort == '手数料') {

              getCommissionData = `select count(*), SUM(FINALCALLCHARGE) as TOTAL_AMOUNT from 
            byokakin_${targetAgentCode.rows[i].serv_name}_processedcdr_${year}${month} where 
            customercode='${targetAgentCode.rows[i].freedial_code}'`;

            } else {
              getCommissionData = `select count(*), SUM(FINALCALLCHARGE) as TOTAL_AMOUNT from 
              byokakin_${targetAgentCode.rows[i].serv_name}_processedcdr_${year}${month} where 
              terminaltype= '${targetAgentCode.rows[i].call_sort}' 
              and customercode='${targetAgentCode.rows[i].freedial_code}'`;
            }



            const getCommissionDataRes = await db.queryByokakin(getCommissionData, []);

            if (getCommissionDataRes && getCommissionDataRes.rows && getCommissionDataRes.rows.length > 0) {
              let commissionAmt = 0, total_amount = 0;

              if (getCommissionDataRes.rows[0].total_amount != null) {
                commissionAmt = getCommissionDataRes.rows[0].total_amount * targetAgentCode.rows[i].amnt_conv;
                commissionAmt = parseFloat(commissionAmt).toFixed(2);
                total_amount = getCommissionDataRes.rows[0].total_amount;
                subTotalCommissionAmt += parseInt(commissionAmt, 10);
              }
              console.log("subTotalCommissionAmt.."+subTotalCommissionAmt)

              const insertQuery = `insert into agent_commission_details (agent_code, freedial_code, bill_numb, serv_name, call_sort, 
                bill_start, bill_end, bill_amnt, amnt_conv, comm_amnt) VALUES ('${comp_code}','${targetAgentCode.rows[i].freedial_code}',
                '${billNo}','${targetAgentCode.rows[i].serv_name}','${targetAgentCode.rows[i].call_sort}','${year}-${month}-01',
                '${year}-${month}-${getNumberOfDaysInMonth}','${total_amount}','${targetAgentCode.rows[i].amnt_conv}','${commissionAmt}')`;
              const insertRes = await db.queryByokakin(insertQuery, []);
              res.push(insertRes);
              if (res == 'data already there!') {
                throw new Error(res)
              }
            }
          } else if (targetAgentCode.rows[i].serv_name == 'IPSPRO-SONUS_OUTBOUND') {

            let getCommissionData = "", rate = 0;
            if (targetAgentCode.rows[i].call_sort == '携帯') {

              getCommissionData = `select count(*) as total, sum(duration) as duration from cdr_sonus_outbound where to_char(start_time, 'YYYY-MM') 
              ='${year}-${month}' and (left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR 
              left(sonus_egcallednumber,2)='90') and billing_comp_code='${targetAgentCode.rows[i].freedial_code}'`;

              rate = 0.115;
            } else {
              rate = 0.06;
              getCommissionData = `select count(*) as total, sum(duration) as duration from cdr_sonus_outbound where to_char(start_time, 'YYYY-MM') 
              ='${year}-${month}' and left(sonus_egcallednumber,2)!='70' and  left(sonus_egcallednumber,2) != '80' and 
              left(sonus_egcallednumber,2)!='90' and billing_comp_code='${targetAgentCode.rows[i].freedial_code}'`;
            }



            const getCommissionDataRes = await db.query(getCommissionData, []);

            if (getCommissionDataRes && getCommissionDataRes.rows && getCommissionDataRes.rows.length > 0) {

              let commissionAmt = 0, total_amount = 0;

              if (getCommissionDataRes.rows[0].duration != null  ) {
                commissionAmt = getCommissionDataRes.rows[0].duration * rate * targetAgentCode.rows[i].amnt_conv;
                commissionAmt = parseFloat(commissionAmt).toFixed(2);
                total_amount = getCommissionDataRes.rows[0].duration * rate;
                subTotalCommissionAmt += parseInt(commissionAmt, 10);
              }
              console.log("subTotalCommissionAmt.."+subTotalCommissionAmt)

              const insertQuery = `insert into agent_commission_details (agent_code, freedial_code, bill_numb, serv_name, call_sort, 
                bill_start, bill_end, bill_amnt, amnt_conv, comm_amnt) VALUES ('${comp_code}','${targetAgentCode.rows[i].freedial_code}',
                '${billNo}','${targetAgentCode.rows[i].serv_name}','${targetAgentCode.rows[i].call_sort}','${year}-${month}-01',
                '${year}-${month}-${getNumberOfDaysInMonth}','${total_amount}','${targetAgentCode.rows[i].amnt_conv}','${commissionAmt}')`;
              const insertRes = await db.queryByokakin(insertQuery, []);
              res.push(insertRes);
              if (res == 'data already there!') {
                throw new Error(res)
              }

            }


          }


        }

        if (subTotalCommissionAmt > 0) {
          taxCommissionAmt = subTotalCommissionAmt * .1;
          totalCommissionAmt = subTotalCommissionAmt + taxCommissionAmt;
        }




        const insertSummaryData = `insert into agent_commission (agent_code, bill_numb, bill_coun, amount_use,advbefore_pay,advnow_pay,
            total_bill, bill_start, bill_end, bill_issue, bill_due, bill_sum, bill_disc, bill_tax,   bill_total, reco_date, 
            reco_name, modi_date, modi_name, paid_flag, paidprocessby, paidprocessdate , serv_name) VALUES ('${comp_code}','${billNo}','0',
            '${totalCommissionAmt}',0,0,'${totalCommissionAmt}','${year}-${month}-01','${year}-${month}-${getNumberOfDaysInMonth}',now(),'${payment_plan_date}',
             '${subTotalCommissionAmt}',0,'${taxCommissionAmt}', '${totalCommissionAmt}', now(),'${createdBy}', null,'',
             null, null, null, 'NTT-KDDI')`;

        const sumRes = await db.queryByokakin(insertSummaryData, []);

      } else {
        throw new Error('No commission register!')
      }
    } catch (error) {
      console.log("error in getting commission info !" + error.message)
      throw new Error(error.message)
    }
  },


  updateCommissionInfo: async function (param) {

    try {
      console.log("data.." + JSON.stringify(param))

      let amount = 0, commission = 0;

      // // if(param.amount !==null && param.amount!== undefined) {
      // //   amount = param.amount;
      // // }


      if (param.commission !== null && param.commission !== undefined) {
        commission = param.commission;
      }


      const query = `update agent_incentive set amnt_conv='${commission}', 
      edit_by='${param.edit_by}', edit_date=now() , deleted=${param.deleted} where data_idno = ${param.id} `;

      const summaryRes = await db.queryByokakin(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting adding updating kotehi info.." + error.message)
      throw new Error(error.message)
    }
  },

  addCommissionInfo: async function (data) {

    try {


      console.log("data here.." + JSON.stringify(data))

      if (data.comp_code == undefined || data.comp_code == '' || data.carrier == '' || data.carrier == undefined) {
        throw new Error('Invalid request');
      }

      const searchQuery = `select * from agent_incentive where 
        agent_code = '${data.comp_code}' and freedial_code='${data.freedial_code}' 
        and serv_name='${data.carrier}' and call_sort= '${data.call_type}' and deleted = false`;
      console.log("searchQuery.." + (searchQuery))

      const searchRes = await db.queryByokakin(searchQuery);
      if (searchRes && searchRes.rows && searchRes.rows.length > 0) {
        throw new Error("This record is already there, so you can update !!")
      }

      let amount = 0, commission = 0;

      if (data.amount !== null && data.amount !== undefined) {
        amount = data.amount;
      }


      if (data.commission !== null && data.commission !== undefined) {
        commission = data.commission / 100;
      }

      const insertQuery = `insert into agent_incentive (agent_code, freedial_code, serv_name, call_sort, 
          edat_star, edat_fini, amnt_conv, edit_by, edit_date, amount) Values 
                ('${data.comp_code}','${data.freedial_code}','${data.carrier}','${data.call_type}', 
                now(),'3000-01-01','${commission}','${data.addedBy}', now(), '${amount}')`;

      const insertRes = await db.queryByokakin(insertQuery, []);

      if (insertRes && insertRes.rowCount) {
        return insertRes.rowCount;
      } else {
        throw new Error("There is issue while inserting record..." + insertRes)
      }



    } catch (error) {
      console.log("error in getting adding additional kotehi info..." + error.message)
      throw new Error(error.message)
    }
  },





}


