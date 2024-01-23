var db = require('../../config/database');
var utility = require('./../../public/javascripts/utility');
var PDFDocument = require("pdfkit");
var fs = require("fs");
var common = require('./../common/common')
module.exports = {

  
  updateCommissionBatchDetails: async function (data) {
    try {

      console.log("data.."+JSON.stringify(data));

      let batchId = "", updateData="";

      if (data.batch_id !== undefined && data.batch_id !== null && data.batch_id !== '') {
        batchId = data.batch_id;
      } else {
        throw new Error("Invalid request!");
      }


      if (data.email_commission_execution_date) {
        const execution_date =await utility.utcToDateNew(data.email_commission_execution_date)
        updateData = `execution_date= '${execution_date}',`;
      }
    

      if (data.create_comm_execution_date) {
        const execution_date =await utility.utcToDateNew(data.create_comm_execution_date)
        updateData = updateData + `execution_date= '${execution_date}',`;
      }

    
      if (data.enable_value) {
        updateData = updateData + `enable= '${data.enable}',`;
      }
      updateData = updateData + `update_by= '${data.update_by}',`;
      updateData = updateData + `last_update= now()`;

      const query = `update cron_batch_execution_date_time  set ${updateData} where batch_id ='${batchId}' `;

    //    console.log("query.."+query)

      const updateRecord = await db.query(query, []);

      if (updateRecord) {
        return (updateRecord);
      }
      throw new Error('not found')

    } catch (error) {

      console.log("Error .."+error.message)
      throw new Error(error.message)
      //return error;
    }
  },
  
  getCommissionSchedule: async function (date_id) {
    try {
      const query = `SELECT *, (select execution_date from cron_batch_execution_date_time where batch_id=date_id),
      (select enable from cron_batch_execution_date_time where batch_id=date_id) 
         FROM 
      batch_date_control where date_id in (11,12) and deleted=false`;
      const targetDateRes = await db.query(query, []);

      if (targetDateRes.rows) {
        return targetDateRes.rows;
      }
      return { err: 'not found' };
    } catch (error) {
      return error;
    }
  },

  onApproveRowData: async function (data) {
    console.log("data..." + JSON.stringify(data))

    try {

      if (data && data.agent_code !== '' && data.agent_code !== undefined) {
        const checkQuery = `select * from agent_commission_approve_status where customer_id='${data.agent_code}' and billing_period::date ='${data.bill_start}::date'  and deleted = false  `;
        let res = await db.queryByokakin(checkQuery, []);
        if (res && res.rows && res.rows.length > 0) {
          throw new Error('Record already exist!');
        }

      } else {
        throw new Error('Invalid data!')
      }


      const query = `insert into agent_commission_approve_status  (customer_id, status, billing_period, added_by , date_added, updated_by, updated_date) 
      values ('${data.agent_code}','${data.status}','${data.bill_start}','${data.approvedBy}',now(),'${data.approvedBy}',now())`;

      const getCommissionEmailDetails = `select * from agent_commission_config where agent_id ='${data.agent_code}' and deleted =false limit 1`;

      let getCommissionEmailDetailsRes = await db.queryByokakin(getCommissionEmailDetails, []);

      if (getCommissionEmailDetailsRes && getCommissionEmailDetailsRes.rows.length > 0) {

        let dateTime = new Date(data.bill_start);
        year = dateTime.getFullYear();
        month = dateTime.getMonth() + 1;

        let emailContents = getCommissionEmailDetailsRes.rows[0]['email_content'];
        let emailSubject = getCommissionEmailDetailsRes.rows[0]['email_subject'];
        emailContents = emailContents.replace(/YYYY/g, year);
        emailContents = emailContents.replace(/MM/g, month);

        emailSubject = emailSubject.replace(/YYYY/g, year);
        emailSubject = emailSubject.replace(/MM/g, month);

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


      if (deleteRes) {
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

      if (customerId) {
        WHERE = `where customer_cd = '${customerId}' and is_deleted = false `
      } else {
        WHERE = `where is_deleted = false `
      }

      let customerList = []

      const getAllCustomerList = `select id, customer_cd, customer_name, commission from m_customer ${WHERE} `;
      const getAllCustomerListRes = await db.query(getAllCustomerList, [], true);

      const getAllAgentList = `select agent_code from agent_incentive where edat_fini::date > now() and deleted=false  `;
      const getAllAgentListRes = await db.queryByokakin(getAllAgentList, []);

      if (getAllCustomerListRes && getAllCustomerListRes.rows && getAllCustomerListRes.rows.length > 0 && getAllAgentListRes
        && getAllAgentListRes.rows && getAllAgentListRes.rows.length > 0) {

        customerList = getAllCustomerListRes.rows.filter((obj) => {
          let ind = -1
          ind = getAllAgentListRes.rows.findIndex((ele) => (ele.agent_code == obj.customer_cd));
          return ind === -1 ? false : true;
        })
      }

      console.log("customer list==" + JSON.stringify(customerList))

      return customerList;

    } catch (error) {
      return error;
    }
  },


  getCommissionConfig: async function (data) {

    try {
      const query = `select * from agent_commission_config where deleted = false order by agent_id `;
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
      if (deleteRes) {
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

      if (data && data.comp_code !== '') {
        const checkQuery = `select * from agent_commission_config where agent_id='${data.comp_code}' and deleted = false  `;
        let res = await db.queryByokakin(checkQuery, []);
        if (res && res.rows && res.rows.length > 0) {
          throw new Error('Record already exist!');
        }

      } else {
        throw new Error('Invalid data!')
      }


      const query = `insert into agent_commission_config  (agent_id, payment_due_date_mode, email_content, email_subject , email_to, email_cc, date_added,added_by) 
      values ('${data.comp_code}','${data.payment_plan_type}','${data.email_content}','${data.email_subject}','${data.email_to}','${data.email_cc}',now(),'${data.addedBy}')`;

      //  console.log("query.."+query)

      const deleteRes = await db.queryByokakin(query, []);


      if (deleteRes) {
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

      if (data.agent_id !== undefined && data.agent_id !== null && data.agent_id !== '') {
        agentId = data.agent_id;
      } else {
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


      if (deleteRes) {
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

      const yearMonth = `${year}-${month}-1` ;
      const dateObj = utility.getPreviousYearMonth(yearMonth)

      const prevYear = dateObj.year
      const prevMonth = dateObj.month;

      let where = `WHERE bill_start::date ='${year}-${month}-1' and bill_sum > 0`;
      if (comp_code != undefined && comp_code != '' && comp_code != null) {
        where += `AND agent_code='${comp_code}'`;
      }
      const query = `select * , (select bill_sum from agent_commission as acomm where bill_start::date ='${prevYear}-${prevMonth}-1' 
      and curr_agent_code=agent_code) as prev_bill_sum ,(select bill_tax from agent_commission as acomm where bill_start::date ='${prevYear}-${prevMonth}-1' 
      and curr_agent_code=agent_code) as prev_bill_tax,
      (select bill_total from agent_commission as acomm where bill_start::date ='${prevYear}-${prevMonth}-1' 
      and curr_agent_code=agent_code) as prev_bill_total
      from  (select *, agent_code as curr_agent_code from agent_commission ${where} )as lj left join (select status, customer_id from agent_commission_approve_status 
        where billing_period::date ='${year}-${month}-1' ) as rj on (lj.agent_code = rj.customer_id) order by lj.agent_code `;

      console.log("get commissom details  query.." + query)
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

  deleteCommissionDetails: async function (comp_code, year, month) {

    const deleteCommissionProcessedData = `delete from agent_commission where agent_code ='${comp_code}' and bill_start::date ='${year}-${month}-01' `;
    const deleteCommissionProcessedData1 = `delete from agent_commission_details where agent_code ='${comp_code}' and bill_start::date ='${year}-${month}-01' `;

    console.log("deleteCommissionProcessedData.." + deleteCommissionProcessedData);
    console.log("deleteCommissionProcessedData1.." + deleteCommissionProcessedData1);

    const deleteCommissionProcessedDataRes = await db.queryByokakin(deleteCommissionProcessedData, []);
    const deleteCommissionProcessedDataRes1 = await db.queryByokakin(deleteCommissionProcessedData1, []);

    return null;

  },



  createCommissionDetails: async function ({ comp_code, year, month, payment_plan_date, createdBy }) {

    let billNo = 1000;
    const getNumberOfDaysInMonth = utility.daysInMonth(month, year);

    try {

      if (comp_code == undefined || comp_code == '') {
        throw new Error('Invalid Request')
      }
      let addMonth = 2;
      // if(payment_plan_date == 'Monthly'){
      //   addMonth = 2;
      // }else if(payment_plan_date == 'Two Months'){
      //   addMonth = 3;
      // }else if(payment_plan_date == 'Half Yearly'){
      //     // half yearly means =>( May ~ Oct And Nov ~ April) these are the target commission month              
      //   addMonth = 2;
      // }else if(payment_plan_date == 'Yearly'){
      //     // yearly means =>( Nov ~ Oct)
      //   addMonth = 2;
      // }
      // const myData1 = new Date(`'${year}-${month}-1'`);
      // const currentYearMonth  = new Date(myData1.setMonth(myData1.getMonth()+1));
      // const currentYear = currentYearMonth.getFullYear();
      // const currentMonth = currentYearMonth.getMonth()+1;


      const myDate = new Date(`'${year}-${month}-1'`);
      const paymentDueYearMonth = new Date(myDate.setMonth(myDate.getMonth() + addMonth));
      const billingDueYear = paymentDueYearMonth.getFullYear();
      const billingDueMonth = paymentDueYearMonth.getMonth() + 1;

      const lastDayOfMonth = new Date(billingDueYear, billingDueMonth, 0);

      const billingDueDay = lastDayOfMonth.getDate();


      // check first weekend 

      const getHolidays = await common.getHolidayByYear(billingDueYear);

      const validDay = await getValidDate(billingDueYear, billingDueMonth, billingDueDay, getHolidays);

      const validPaymentPlanDate = `${billingDueYear}-${billingDueMonth}-${validDay}`;

      console.log("validPayemt date is " + validPaymentPlanDate);

 

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

            console.log("subTotalCommissionAmt.." + subTotalCommissionAmt)


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
              console.log("subTotalCommissionAmt.." + subTotalCommissionAmt)

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

              if (getCommissionDataRes.rows[0].duration != null) {
                commissionAmt = getCommissionDataRes.rows[0].duration * rate * targetAgentCode.rows[i].amnt_conv;
                commissionAmt = parseFloat(commissionAmt).toFixed(2);
                total_amount = getCommissionDataRes.rows[0].duration * rate;
                subTotalCommissionAmt += parseInt(commissionAmt, 10);
              }
              console.log("subTotalCommissionAmt.." + subTotalCommissionAmt)

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
            '${totalCommissionAmt}',0,0,'${totalCommissionAmt}','${year}-${month}-01','${year}-${month}-${getNumberOfDaysInMonth}',now(),'${validPaymentPlanDate}',
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


  createCommissionInvoice: async function ({ comp_code, year, month, payment_plan_date, createdBy }) {

    try {

      let invoiceData = await getInvoiceData(year, month, comp_code);
      let invoiceDataSummary = await getInvoiceSummaryData(year, month, comp_code);
      const allCustomerDetatils = await getCustomerDetails();
      const customerAddress = allCustomerDetatils.filter((obj) => (obj.customer_cd == comp_code ? true : false))
      const IPSAddress = allCustomerDetatils.filter((obj) => (obj.customer_cd == '00000130' ? true : false))
      let path = __dirname + `\\pdf\\1${comp_code}${year}${month}.pdf`;
      let totalCallAmount = 0;



      invoiceData = invoiceData.map(obj => {
        totalCallAmount = totalCallAmount + parseInt(obj.comm_amnt);
        let ind = allCustomerDetatils.findIndex((ele) => (ele.customer_cd == obj.freedial_code))
        if (ind !== -1) {
          return { ...obj, freedial_name: allCustomerDetatils[ind]['customer_name'] }
        } else {
          return { ...obj, freedial_name: '' }
        }
      });
      await createInvoice(comp_code, year, month, invoiceData, path, totalCallAmount, customerAddress, IPSAddress, invoiceDataSummary);
      console.log("Done...")
    } catch (err) {
      console.log("error...." + err.message);
    }
  },
}

async function createInvoice(company_code, billingYear, billingMonth, invoice, path, subTotal, customerAddress, IPSAddress, invoiceDataSummary) {

  let tax = parseInt(subTotal * .1);
  let totalCallAmount = parseInt(subTotal) + (tax);
  let doc = new PDFDocument({ margin: 50 });
  let MAXY = doc.page.height - 50;
  let fontpath = (__dirname + '\\..\\..\\controllers\\font\\ipaexg.ttf');
  doc.font(fontpath);
  await generateHeader(customerAddress, doc, totalCallAmount);
  let billIssueDate = new Date();
  let paymentDueDate = new Date();
  let billNo = "";
  if (invoiceDataSummary && invoiceDataSummary.length > 0) {
    billIssueDate = invoiceDataSummary[0]['bill_issue'];
    paymentDueDate = invoiceDataSummary[0]['bill_due'];
    billNo = invoiceDataSummary[0]['bill_numb'];
  }

  let y = generateCustomerInformation(company_code, billingYear, billingMonth, doc, invoice, 210, billIssueDate, totalCallAmount, paymentDueDate, billNo);

  //drawLine(doc, 198);
  console.log("y=--" + y);
  addTableHeaderFC(doc, 50, y + 45);
  y = customTableFC(doc, y + 55, invoice, MAXY);
  y = tableSummary(doc, 350, y, subTotal);
  // y = genrateAccountInfo(doc, y);
  // generateFooter(doc, y + 10);
  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function tableSummary(doc, x, y, subTotal) {

  let tax = parseInt(subTotal * .1);
  let totalCallAmount = parseInt(subTotal) + (tax);

  doc
    .fontSize(8)

    .text(`小合計`, x + 30, y + 20, { width: 150, align: "left" })
    .text(`消費税`, x + 30, y + 35, { width: 150, align: "left" })
    // drawLine(doc, y + 48, x + 50, 500)
    .text(`合計額`, x + 30, y + 50, { width: 150, align: "left" })
    .text(`¥${utility.numberWithCommas(subTotal)}`, x + 100, y + 20, { width: 100, align: "right" })
    .text(`¥${utility.numberWithCommas(tax)}`, x + 100, y + 35, { width: 100, align: "right" })
    .text('¥' + utility.numberWithCommas(totalCallAmount), x + 100, y + 50, { width: 100, align: "right" })


  doc.rect(380, y + 15, 110, 15).stroke()
  doc.rect(380, y + 30, 110, 15).stroke()
  doc.rect(380, y + 45, 110, 15).stroke()


  doc.rect(490, y + 15, 70, 15).stroke()
  doc.rect(490, y + 30, 70, 15).stroke()
  doc.rect(490, y + 45, 70, 15).stroke()

    .moveDown();
  return y + 100;
}



async function generateHeader(customerDetails, doc) {

  let postNumber = customerDetails[0]['post_number'];
  let customerName = customerDetails[0]['customer_name'] + '御中';
  let address = customerDetails[0]['address'];

  if (postNumber) {
    postNumber = [postNumber.slice(0, 3), '-', postNumber.slice(3)].join('');
  }

  doc
    // .image("logo.png", 50, 45, { width: 50 })
    //.fillColor("#444444")
    .fontSize(10)
    .text(`〒${postNumber}`, 65, 12)
    .text(`${address}`, 65, 25)
    .text(`${customerName}`, 65, 51)

    .text("株式会社アイ・ピー・エス・プロ", 10, 110, { align: "right" })
    .text("〒104-0061", 10, 123, { align: "right" })
    .text("東京都中央区銀座4-12-15 歌舞伎座タワー8F", 10, 136, { align: "right" })
    .text("IPS（請求対象外）", 10, 149, { align: "right" })
    .text("TEL : 03-3549-7626", 10, 162, { align: "right" })
    .text("FAX : 03-3545-7331", 10, 175, { align: "right" })

    .text("コミッション金額", 0, 188, { align: "center" })
    .moveDown();

}


function customTableFC(doc, y, data, MAXY) {
  console.log("in table FC");
  let height = y;
  let counter = 1;
  for (let i = 0; i < data.length; i++) {
    height = height + 20;
    textInRowFirst(doc, i + 1, 50, height, "center", 15);
    textInRowFirst(doc, data[i].freedial_name, 65, height, null, 265);
    textInRowFirst(doc, data[i].serv_name, 330, height, "right", 50);
    textInRowFirst(doc, ((data[i].call_sort)), 380, height, "right", 60);
    textInRowFirst(doc, (parseFloat(data[i].amnt_conv * 100).toFixed(3)), 440, height, "right", 50);
    textInRowFirst(doc, utility.numberWithCommas(parseInt(data[i].comm_amnt)) + '円', 490, height, "right", 70);
    // textInRowFirst(doc, utility.numberWithCommas(parseInt(data[i].total_amount)), 400, height, "right");

    if (height >= 680) {
      doc.text(counter, 500, 720)
      doc.addPage({ margin: 50 })
      height = 50;
      counter++;
      //addTableHeader(doc, 50, 50);

    }
  }
  doc.text(counter, 500, 720)

  return height;
}



function addTableHeaderFC(doc, x, y) {
  console.log("y---" + y);

  doc
    .fontSize(10)
    .text(`No`, 50, y, { width: 15, align: "center" })
  doc.rect(50, y - 5, 15, 30).stroke()
    .text(`エンドユーザー `, 65, y, { width: 265, align: "center" })
  doc.rect(65, y - 5, 265, 30).stroke()
    .text(`キャリア`, 330, y, { width: 50, align: "center" })
  doc.rect(330, y - 5, 50, 30).stroke()
    .text(`端末`, 380, y, { width: 60, align: "center" })
  doc.rect(380, y - 5, 60, 30).stroke()
    .text(`%`, 440, y, { width: 50, align: "center" })
  doc.rect(440, y - 5, 50, 30).stroke()
    .text(`円`, 490, y, { width: 70, align: "center" })
  doc.rect(490, y - 5, 70, 30).stroke()

    //drawLine(doc, y)
    .moveDown();
}




function textInRowFirst(doc, text, x, heigth, align, width) {

  doc.y = heigth;
  doc.x = x;
  doc.fontSize(8)
  doc.fillColor('black')
  doc.text(text, { width, align })
  doc.rect(x, heigth - 5, width, 20).stroke()

  return doc;
}



function generateCustomerInformation(company_code, billingYear, billingMonth, doc, invoice, y, billIssueDate, totalAmount, paymentDueDate, billNo) {

  doc
    .text(`代理店コード番号`, 50, y, { width: 100, align: "center" })
    .text(`文書番号`, 150, y, { width: 100, align: "center" })
    .text(`ご利用年月度`, 250, y, { width: 100, align: "center" })
    .text(`発行年月日`, 350, y, { width: 100, align: "center" })
    .text(`支払予定日`, 450, y, { width: 100, align: "center" })


    .text(`AGENT CODE`, 50, y + 10, { width: 100, align: "center" })
    .text(`DOC NUMBER`, 150, y + 10, { width: 100, align: "center" })
    .text(`USED PERIOD`, 250, y + 10, { width: 100, align: "center" })
    .text(`DATE OF ISSUE`, 350, y + 10, { width: 100, align: "center" })
    .text(`PAYMENT PLAN DATE`, 450, y + 10, { width: 110, align: "center" })

  doc.rect(50, y - 5, 100, 30).stroke()
  doc.rect(150, y - 5, 100, 30).stroke()
  doc.rect(250, y - 5, 100, 30).stroke()
  doc.rect(350, y - 5, 100, 30).stroke()
  doc.rect(450, y - 5, 110, 30).stroke()

    //drawLine(doc, y + 22)
    .fontSize(8)
    .text(`${company_code}`, 50, y + 30, { width: 100, align: "center" })
    .text(billNo, 150, y + 30, { width: 100, align: "center" })
    .text(`${billingYear}/${billingMonth}/01～ ${billingYear}/${billingMonth}/${utility.daysInMonth(billingMonth, billingYear)}`, 250, y + 30, { width: 100, align: "center" })
    .text(`${utility.getCurrentYearMonthDay(billIssueDate)}`, 350, y + 30, { width: 100, align: "center" })
    .text(utility.getCurrentYearMonthDay(paymentDueDate), 450, y + 30, { width: 110, align: "center" })

  doc.rect(50, y + 25, 100, 25).stroke()
  doc.rect(150, y + 25, 100, 25).stroke()
  doc.rect(250, y + 25, 100, 25).stroke()
  doc.rect(350, y + 25, 100, 25).stroke()
  doc.rect(450, y + 25, 110, 25).stroke()


    // doc.rect(350, y - 5, 100, 30).stroke()
    // doc.rect(450, y - 5, 110, 30).stroke()
    .fontSize(15)
    .text(`ｺﾐｯｼｮﾝ金額`, 350, y + 60, { width: 100, align: "center" })
    .text('¥' + utility.numberWithCommas(totalAmount), 450, y + 60, { width: 110, align: "center" })

  doc.rect(350, y + 50, 100, 30).stroke()
  doc.rect(450, y + 50, 110, 30).stroke()




    //row(doc, 200)    
    .moveDown();
  return y + 55;
}


async function getCustomerDetails() {
  try {
    const getAllCustomerList = `select * from m_customer where is_deleted=false`;
    const getAllCustomerListRes = await db.query(getAllCustomerList, [], true);
    return getAllCustomerListRes.rows;
  } catch (err) {
    throw new Error("Error in getting customer details.." + err.message)
  }
}

async function getInvoiceData(year, month, comp_code) {

  try {

    let where = `WHERE bill_start::date ='${year}-${month}-1' and comm_amnt > 0 AND agent_code='${comp_code}'`;

    const query = `select data_idno as id, agent_code, freedial_code, bill_numb, serv_name, call_sort, 
    bill_start, bill_end, bill_amnt, amnt_conv, comm_amnt from agent_commission_details ${where} 
    order by freedial_code asc`;

    console.log("query.." + query)

    const summaryRes = await db.queryByokakin(query, []);

    if (summaryRes.rows) {
      return (summaryRes.rows);
    }
    throw new Error('not found')


  } catch (err) {
    console.log("error in fetching invoice details..." + err.message)
    throw new Error(err.message)
  }

}

async function getInvoiceSummaryData(year, month, comp_code) {

  try {

    let where = `WHERE bill_start::date ='${year}-${month}-1' AND agent_code='${comp_code}'`;

    const query = `select id, agent_code, bill_numb, bill_coun, amount_use, total_bill, bill_start::date, bill_end::date, bill_issue::date, 
    bill_due::date, bill_sum, bill_disc, bill_tax, bill_total  from agent_commission ${where} limit 1`;

    console.log("query.." + query)

    const summaryRes = await db.queryByokakin(query, []);

    if (summaryRes.rows) {
      return (summaryRes.rows);
    }
    throw new Error('not found')


  } catch (err) {
    console.log("error in fetching invoice details..." + err.message)
    throw new Error(err.message)
  }

}



async function getValidDate(billingDueYear, billingDueMonth, billingDueDay, getHolidays) {


  let actualBillingMonth = billingDueMonth - 1;

  var actualDayValue = billingDueDay;

  if (billingDueDay < 1) {
    return billingDueDay;
  }

  async function callRec(billingDueYear, billingDueMonth,actualBillingMonth,  actualDayValue, getHolidays) {

    const checkIfWeekend = await common.checkIfWeekend(billingDueYear, actualBillingMonth, actualDayValue);
    const checkIfHoilday = await common.checkIfHoilday(billingDueYear, billingDueMonth, actualDayValue, getHolidays);
    if (checkIfWeekend || checkIfHoilday) {
      actualDayValue = actualDayValue - 1;
      return await callRec(billingDueYear, billingDueMonth,actualBillingMonth, actualDayValue, getHolidays)
    } else {
      return actualDayValue;
    }
  }

  return  await callRec(billingDueYear, billingDueMonth, actualBillingMonth, actualDayValue, getHolidays) ;

}