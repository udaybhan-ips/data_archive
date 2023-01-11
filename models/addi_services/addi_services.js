var db = require('../../config/database');
var utility = require('../../public/javascripts/utility');

module.exports = {
  getInvoiceInfo: async function (data) {

    try {
      const query = `select * from addi_service_history order by date_bill desc `;

      //  console.log("query.."+query)

      const summaryRes = await db.queryIBS(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting additional services info !" + error.message)
      throw new Error(error.message)
    }
  },

  deleteInvoiceSummary: async function (data) {

    console.log("data..." + JSON.stringify(data))



    try {
      const query = `delete from addi_service_history where bill_numb ='${data.bill_numb}' `;

      //  console.log("query.."+query)

      const deleteRes = await db.queryIBS(query, []);


      if (deleteRes) {
        return (deleteRes);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in delete additional services data !" + error.message)
      throw new Error(error.message)
    }
  },

  getAddiServiceSummaryData: async function ({ year, month, comp_code }) {

    try {

      if (year == undefined || year == '' || year == null || month == undefined || month == '' || month == null) {
        throw new Error('Invalid Request!')
      }
      let where = `WHERE bill_term_start::date ='${year}-${month}-1' `;
      if (comp_code != undefined && comp_code != '' && comp_code != null) {
        where += `AND customer_code='${comp_code}'`;
      }
      const query = ` select * from addi_service_history ${where} order by customer_code `;
      const summaryRes = await db.queryIBS(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting additional data summary !" + error.message)
      throw new Error(error.message)
    }
  },

  getAddiServiceDetailsData: async function ({ year, month, comp_code }) {

    try {

      if (year == undefined || year == '' || year == null || month == undefined || month == '' || month == null) {
        throw new Error('Invalid Request!')
      }

      let where = `WHERE bill_term_start::date ='${year}-${month}-1' `;

      if (comp_code != undefined && comp_code != '' && comp_code != null) {
        where += `AND customer_code='${comp_code}'`;
      }

      const query = `select * from addi_service_detail ${where}  order by customer_code asc`;

      console.log("query.." + query)

      const summaryRes = await db.queryIBS(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting additonal service data details !" + error.message)
      throw new Error(error.message)
    }
  },

  createAddiServiceDetails: async function ({ comp_code, year, month, payment_plan_date, createdBy }) {

    let billNo = 1000;
    const getNumberOfDaysInMonth = utility.daysInMonth(month, year);
    try {
      if (comp_code == undefined || comp_code == '') {
        throw new Error('Invalid Request')
      }
      const checkQuery = `select * from addi_service_history where customer_code='${comp_code}' and bill_term_start::date ='${year}-${month}-01' `;
      const resCheckQuery = await db.queryIBS(checkQuery, []);
      if (resCheckQuery && resCheckQuery.rows && resCheckQuery.rows.length > 0) {
        throw new Error('Data already there!!')
      }

      const query = ` select * from addi_service_customer_details where customer_code='${comp_code}' and deleted=false `;
      const detailAddiServiceData = await db.queryIBS(query, []);

      const getBillNoQuery = `select max(bill_no) as max_bill_no from addi_service_history `;
      const billNoRes = await db.queryIBS(getBillNoQuery, []);
      if (billNoRes.rows && billNoRes.rows.length > 0 && billNoRes.rows[0].max_bill_no !== null && billNoRes.rows[0].max_bill_no !== 'null') {
        billNo = parseInt(billNoRes.rows[0].max_bill_no, 10) + 1;
      }

      if (detailAddiServiceData && detailAddiServiceData.rows && detailAddiServiceData.rows.length > 0) {

        let res = [];
        let rateCount = 0, rateSecond = 0, quantity = 0, rateSecondAmount = 0, totalDuration = 0, rateCountAmount = 0, remarks = '', tax = 0, totalAmount = 0;

        let queryData = ""
        if (comp_code == '00000997') {
          queryData = `select count(*) as count, sum(duration::numeric) as duration from cdr_${year}${month} 
  where term_carrier_id='${detailAddiServiceData.rows[0].term_carrier_id}' or orig_carrier_id ='${detailAddiServiceData.rows[0].orig_carrier_id}'`
        } else {
          queryData = `select count(*) as count, sum(duration::numeric) as duration from cdr_${year}${month} 
  where term_carrier_id='${detailAddiServiceData.rows[0].term_carrier_id}'`
        }




        const queryDataRes = await db.query(queryData, []);
        for (let i = 0; i < queryDataRes.rows.length; i++) {



          rateCount = detailAddiServiceData.rows[0]['rate_count'];
          rateSecond = detailAddiServiceData.rows[0]['rate_second'];
          quantity = queryDataRes.rows[i]['count'];
          totalDuration = queryDataRes.rows[i]['duration'];

          rateSecondAmount = parseFloat(rateSecond) * parseFloat(totalDuration);
          rateCountAmount = parseFloat(rateCount) * parseFloat(quantity);

          rateSecondAmount= parseInt(rateSecondAmount);
          rateCountAmount = parseInt(rateCountAmount);

          tax = ((rateSecondAmount) + (rateCountAmount)) * .1;
          tax = parseInt(tax,10);
          totalAmount = parseInt(rateSecondAmount,10) + parseInt(rateCountAmount,10) + parseInt(tax,10);


          const insertQuery = `insert into addi_service_detail (bill_no, customer_code, date_bill, bill_term_start, bill_term_end, 
                rate, quantity, total_amount, name_insert, date_insert, remarks) VALUES ('${billNo}','${comp_code}',
                now(),'${year}-${month}-01', '${year}-${month}-${getNumberOfDaysInMonth}','${rateCount}','${quantity}',
                '${rateCountAmount}','${createdBy}',now(),'6012-通話回数（国内）')`;

          const insertQuery1 = `insert into addi_service_detail (bill_no, customer_code, date_bill, bill_term_start, bill_term_end, 
                  rate, quantity, total_amount, name_insert, date_insert, remarks) VALUES ('${billNo}','${comp_code}',
                  now(),'${year}-${month}-01', '${year}-${month}-${getNumberOfDaysInMonth}','${rateSecond}','${totalDuration}',
                  '${rateSecondAmount}','${createdBy}',now(),'6012-通話秒数（国内）')`;

          const insertRes = await db.queryIBS(insertQuery, []);
          const insertRes1 = await db.queryIBS(insertQuery1, []);
          res.push(insertRes);
          res.push(insertRes1);

        }


        const insertSummaryData = `insert into addi_service_history (customer_code, bill_no, date_payment, bill_term_start,bill_term_end,bill_second,
          bill_rate, bill_amount , tax,amount, date_insert, name_insert, call_count) VALUES ('${comp_code}','${billNo}','${payment_plan_date}',
          '${year}-${month}-01','${year}-${month}-${getNumberOfDaysInMonth}','${totalDuration}',0,
          '${parseInt(rateSecondAmount,10) + parseInt(rateCountAmount,10)}','${tax}','${totalAmount}',now(),'${createdBy}', ${quantity})`;

        const sumRes = await db.queryIBS(insertSummaryData, []);
      }

    } catch (error) {
      console.log("error in getting additional services info !" + error.message)
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

  addAddiServiceInfo: async function (data) {

    try {


      console.log("data here.." + JSON.stringify(data))

      if (data.comp_code == undefined || data.comp_code == '') {
        throw new Error('Invalid request');
      }

      const searchQuery = `select * from addi_service_customer_details where 
      customer_code = '${data.comp_code}' and deleted = false`;
      console.log("searchQuery.." + (searchQuery))

      const searchRes = await db.queryIBS(searchQuery);
      if (searchRes && searchRes.rows && searchRes.rows.length > 0) {
        throw new Error("This record is already there, so you can update !!")
      }

      let rate_count = 0, rate_second = 0, orig_carrier_id = 0, term_carrier_id = 0;

      if (data.rate_count !== null && data.rate_count !== undefined) {
        rate_count = data.rate_count;
      }

      if (data.rate_second !== null && data.rate_second !== undefined) {
        rate_second = data.rate_second;
      }

      if (data.term_carrier_id !== null && data.term_carrier_id !== undefined) {
        term_carrier_id = data.term_carrier_id;
      }

      if (data.orig_carrier_id !== null && data.orig_carrier_id !== undefined) {
        orig_carrier_id = data.orig_carrier_id;
      }

      const insertQuery = `insert into addi_service_customer_details (customer_code, orig_carrier_id, term_carrier_id, rate_count, 
        rate_second, added_by, date_added) Values 
                ('${data.comp_code}','${orig_carrier_id}','${term_carrier_id}','${rate_count}', '${rate_second}', 
                '${data.addedBy}', now())`;

      const insertRes = await db.queryIBS(insertQuery, []);

      if (insertRes && insertRes.rowCount) {
        return insertRes.rowCount;
      } else {
        throw new Error("There is issue while inserting record..." + insertRes)
      }

    } catch (error) {
      console.log("error in getting adding additional service info..." + error.message)
      throw new Error(error.message)
    }
  },


  getAddiServiceDetails: async function (data) {

    try {
      const query = `select * from addi_service_customer_details where deleted=false order by customer_code desc `;

      //  console.log("query.."+query)

      const summaryRes = await db.queryIBS(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting additional services info !" + error.message)
      throw new Error(error.message)
    }
  },


}


