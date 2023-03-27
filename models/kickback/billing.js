var utility = require('../../public/javascripts/utility');
var db = require('./../../config/database');
const BATCH_SIZE = 1000000;
const CDR_SONUS_BILLING_CS = 'cdr_sonus_billing_cs';

var PDFDocument = require("pdfkit");

var fs = require("fs");



module.exports = {
  getRates: async function (customer_id) {
    try {
      const query = `select data_id, customer_id, range_from, range_to, minute_rate, rate_valid_start, rate_valid_end from kickback_rate where  customer_id ='${customer_id}' `;
      const ratesRes = await db.queryIBS(query, []);

      // console.log("ratesRes="+JSON.stringify(ratesRes.rows));

      if (ratesRes.rows) {
        // console.log("if")
        return (ratesRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get rates =" + error.message);
      return error;
    }
  },

  getTableName: async function (targetDate, __type) {
    try {
      const year = new Date(targetDate).getFullYear();
      let month = new Date(targetDate).getMonth() + 1;

      if (parseInt(month, 10) < 10) {
        month = '0' + month;
      }

      if(__type ==='billcdr'){
        return `billcdr_${year}${month}`;
      }else{
        return `cdr_${year}${month}`;
      }      

    } catch (e) {
      console.log("err in get table=" + e.message);
      return console.error(e);
    }
  },
  getRatesFC: async function () {
    try {
      const query = `select * from rate_kickback  `;
      const ratesRes = await db.queryIBS(query, []);

      // console.log("ratesRes="+JSON.stringify(ratesRes.rows));

      if (ratesRes.rows) {
        // console.log("if")
        return (ratesRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get rates FC =" + error.message);
      return error;
    }
  },
  getCarrierInfo: async function () {
    try {
      const query = `select carrier_code, carrier_name from carrier `;
      const carrierRes = await db.queryIBS(query, []);
      if (carrierRes.rows) {
        return (carrierRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in carrier info =" + error.message);
      return error;
    }
  },
  getBillNoInfo: async function () {
    try {
      const query = `select max(bill_no) as max_bill_no from kickback_history `;
      const billNoRes = await db.queryIBS(query, []);
      if (billNoRes.rows) {
        return { 'max_bill_no': (billNoRes.rows[0].max_bill_no) };
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in bill no info =" + error.message);
      return error;
    }
  },

  get03Numbers: async function (customer_id) {
    try {
      const query = `select substring(_03_numbers, 2, 10) as _03_numbers, customer_cd from _03numbers where customer_cd='${customer_id}' order by _03_numbers asc `;
      const get03NumRes = await db.queryIBS(query, []);
      console.log("query==" + query);
      if (get03NumRes.rows) {
        return (get03NumRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get 03 numbers =" + error.message);
      return error;
    }
  },
  get03NumbersValid: async function (customer_id, dailyBatch) {
    try {

      let query = '';

      if (dailyBatch) {
        query = `select substring(_03_numbers, 2, 10) as _03_numbers, customer_cd from _03numbers where customer_cd='${customer_id}' and daily_batch='${dailyBatch}' and valid_flag=0 order by _03_numbers asc `;
      } else {
        query = `select substring(_03_numbers, 2, 10) as _03_numbers, customer_cd from _03numbers where customer_cd='${customer_id}' and valid_flag=0 order by _03_numbers asc `;
      }


      const get03NumRes = await db.queryIBS(query, []);
      console.log("query==" + query);
      if (get03NumRes.rows) {
        return (get03NumRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get 03 numbers =" + error.message);
      return error;
    }
  },
  getKickCompList: async function () {

    try {
      const query = `select customer_id, service_type, cell_phone_limit from kickback_billable 
       where  deleted=false  order by  customer_id     `;

       //where  deleted=false and customer_id in ('00001101','00001282') order by  customer_id     `;
      const getKickCompListRes = await db.queryIBS(query, []);

      if (getKickCompListRes.rows) {
        return (getKickCompListRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get kick comp list =" + error.message);
      return error;
    }
  },
  getKickCompCallsInfo: async function (customer_id) {

    console.log("get calls info of " + customer_id);

    try {
      const query = `select count(*) as total, sum(duration)/60 as total_duration ,kick_company from billcdr_202302 
      where kick_company='${customer_id}' group by kick_company`;
      const getKickCompCallsInfoRes = await db.queryIBS(query, []);

      if (getKickCompCallsInfoRes.rows) {
        return (getKickCompCallsInfoRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get kick comp calls info =" + error.message);
      return error;
    }
  },
  getTargetDate: async function (date_id) {
    try {
      const query = `SELECT max(date_set)::date - interval '1 month' as target_billing_month, max(date_set)::date as current_montth FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
      const targetDateRes = await db.query(query, []);
      //console.log(targetDateRes);
      if (targetDateRes.rows) {
        return { 'target_billing_month': (targetDateRes.rows[0].target_billing_month), 'current_montth': (targetDateRes.rows[0].current_montth) };
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get target cdr =" + error.message);
      return error;
    }
  },

  getTargetDateByTermUse: async function (customerInfo) {
    const limitSec = parseInt(customerInfo.cell_phone_limit, 10) * 60;
    try {
      const query = ` select max(start_time) as limit_date_time, sum(duration) as total_duration, count(*) from (select start_time, duration,  sum(duration) 
      OVER (order by start_time asc) as cum_sum from billcdr_202302 where kick_company='${customerInfo.customer_id}' and term_use=2 ) as t
       where cum_sum <= ${limitSec}`;
      console.log(query);
      const targetDateByTermUseRes = await db.queryIBS(query, []);
      //console.log(targetDateRes);
      if (targetDateByTermUseRes.rows) {
        return { 'isExceed': true, 'limit_date_time': (targetDateByTermUseRes.rows[0].limit_date_time), 'customer_id': (customerInfo.customer_id) };
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get target cdr =" + error.message);
      return error;
    }
  },



  getTargetCDR: async function (kickCompany, service_type, year, month, _03_numbers_arr, isExceed, exceedLimitTime) {

    let _03_numbers = '';
    let query = "";

    try {
      for (let i = 0; i < _03_numbers_arr.length; i++) {
        _03_numbers = _03_numbers + `'${_03_numbers_arr[i]['_03_numbers']}',`;
      }
      //remove last , from string
      if (_03_numbers.substr(_03_numbers.length - 1) == ',') {
        _03_numbers = _03_numbers.substring(0, _03_numbers.length - 1);
      }
      if (service_type == 'rate_base') {
        query = `select count(*) as total_calls, sum(duration) as total_duration , term_ani 
      from billcdr_202302 where term_ani in (${_03_numbers}) and duration>1 and call_status in (16, 31) group by term_ani order by term_ani  `;
      } else {
        if (isExceed || kickCompany == '00000697') {
          let queryTermUse1 = `select count(*) as total_calls, sum(duration) as total_duration , company_code, carrier_code, term_carrier_id 
          from billcdr_202302 where duration>1 and call_status in (16, 31) and term_ani in (select substring(_03_numbers, 2, 10) as _03_numbers 
          from _03numbers where customer_cd='${kickCompany}' and valid_flag = 0) and term_use=1 group by   company_code, carrier_code, term_carrier_id 
          order by  company_code, carrier_code, term_carrier_id`;
          let queryTermUse2 = "";

          if (isExceed) {
            queryTermUse2 = `select count(*) as total_calls, sum(duration) as total_duration , company_code, carrier_code, term_carrier_id 
            from billcdr_202302 where duration>1 and call_status in (16, 31) and term_ani in (select substring(_03_numbers, 2, 10) as _03_numbers
             from _03numbers where customer_cd='${kickCompany}' and valid_flag = 0) and term_use=2 and start_time<='${exceedLimitTime}' group by   company_code, carrier_code, term_carrier_id 
            order by  company_code, carrier_code, term_carrier_id`;

          } else {
            queryTermUse2 = `select count(*) as total_calls, sum(duration) as total_duration , company_code, carrier_code, term_carrier_id 
            from billcdr_202302 where duration>1 and call_status in (16, 31) and term_ani in (select substring(_03_numbers, 2, 10) as _03_numbers
             from _03numbers where customer_cd='${kickCompany}' and valid_flag = 0) and term_use=2 group by   company_code, carrier_code, term_carrier_id 
            order by  company_code, carrier_code, term_carrier_id`;

          }
          console.log("queryTermUse1==" + queryTermUse1);
          console.log("queryTermUse2==" + queryTermUse2);

          const termUse1Res = await db.queryIBS(queryTermUse1);
          const termUse2Res = await db.queryIBS(queryTermUse2);
          const combineData = await combineTwoArray(termUse1Res.rows, termUse2Res.rows);

          console.log("combineData" + JSON.stringify(combineData));

          if (kickCompany == '00000697') {
            return { 'term_use1': termUse1Res.rows, 'term_use2': termUse2Res.rows };
          }

          return combineData;

        } else {
          query = `select count(*) as total_calls, sum(duration) as total_duration , company_code, carrier_code, term_carrier_id 
          from billcdr_202302 where duration>1 and call_status in (16, 31) and term_ani in (select substring(_03_numbers, 2, 10) as _03_numbers
           from _03numbers where customer_cd='${kickCompany}' and valid_flag = 0) group by   company_code, carrier_code, term_carrier_id 
          order by  company_code, carrier_code, term_carrier_id `;
        }

        //in_outbound, trunk_port_target, call_type from     billcdr_kickback_billuse where kick_company='${kickCompany}' `;
      }

      console.log("query==" + query);
      const data = await db.queryIBS(query);

      return data.rows;
    } catch (error) {
      console.log("error in get cdr data=" + error.message);
      return error;
    }
  },
  getTargetCDRByTermUse: async function (kickCompany, year, month, _03_numbers_arr, targetDateTime, term_use) {

    let _03_numbers = '';
    let where = "";

    try {
      for (let i = 0; i < _03_numbers_arr.length; i++) {
        _03_numbers = _03_numbers + `'${_03_numbers_arr[i]['_03_numbers']}',`;
      }
      //remove last , from string
      if (_03_numbers.substr(_03_numbers.length - 1) == ',') {
        _03_numbers = _03_numbers.substring(0, _03_numbers.length - 1);
      }

      if (term_use == 2) {
        where = `where term_ani in (${_03_numbers}) and start_time<='${targetDateTime}' and term_use=2`;
      } else {
        where = `where term_ani in (${_03_numbers})  and term_use=1`;
      }

      const query = `select  * from  billcdr_202302 ${where} `;
      console.log("query==" + query);
      const data = await db.queryIBS(query);

      return data.rows;
    } catch (error) {
      return error;
    }
  },

  deleteSummaryData: async function (customer_id, billing_year, billing_month) {
    try {
      const query = `delete FROM cdr_sonus_outbound_summary where customer_id='${customer_id}' and billing_month='${billing_month}' and billing_year='${billing_year}' `;
      const deleteTargetDateSummaryRes = await db.query(query, []);
      return deleteTargetDateSummaryRes;
    } catch (error) {
      console.log("Error in delete summary function" + error.message);
      return error;
    }
  },
  createDetailData: async function (bill_no, customer_id, year, month, _03_numbers, data) {
    console.log("details" + JSON.stringify(_03_numbers));

    console.log("length=" + _03_numbers.length)
    console.log("data len=" + data.length);

    try {

      for (let i = 0; i < _03_numbers.length; i++) {
        let duration = 0;
        let call_count = 0;
        for (let j = 0; j < data.length; j++) {
          if (_03_numbers[i]['_03_numbers'] == data[j]['term_ani']) {
            duration = duration + parseFloat(data[j]['total_duration']);
            call_count++;
          }
        }

        //console.log("duration=="+duration);

        if (duration > 0) {
          duration = parseInt(duration / 60, 10);
        }
        let item_no = i + 1;
        
        let query = `insert into kickback_detail (bill_no, item_no , item_name, call_minute, amount, remarks, date_update,
          name_update, date_insert, name_insert, call_count) VALUES('${bill_no}', '${item_no}', '${_03_numbers[i]['_03_numbers']}', '${duration}', 0, '' ,'now()','', 'now()',
           'system','${call_count}')`;
        // console.log("query==" + query);
        let insertBillingdetailsRes = await db.queryIBS(query, []);

      }

    } catch (error) {
      console.log("Error---" + error.message);
      return error;
    }
  },

  createDetailDataFC: async function (bill_no, customer_id, year, month, ratesDetails, data, carrierInfo, service_type) {

    let numerOfDays = new Date(year, month, 0).getDate();

    console.log("details FC");
    try {

      let call_count = 0;
      let duration = 0;
      let amount = 0;
      let billAmount = 0;
      let tax = 0;

      for (let i = 0; i < data.length; i++) {
        let info = await getResInfo(data[i], ratesDetails, carrierInfo, month, service_type, i);
        for (let ii = 0; ii < info.length; ii++) {

          call_count = call_count + parseInt(info[ii]['call_count'], 10);
          duration = duration + parseInt(info[ii]['call_sec'], 10);

          amount = amount + (parseInt(info[ii]['amount'], 10));

          let query = `insert into kickback_detail_irregular (bill_no,line_no, item_type , item_name, call_count, call_sec,rate,
                amount, remarks, date_update, name_update, date_insert, name_insert) VALUES('${bill_no}', '${info[ii]['line_no']}', 
                '${info[ii]['item_type']}', '${info[ii]['item_name']}',${info[ii]['call_count']}, ${info[ii]['call_sec']}, ${info[ii]['rate']} 
                ,${info[ii]['amount']},'${info[ii]['remarks']}','now()','system', 'now()','system')`;

          console.log("query==" + query);
          let insertBillingdetailsRes = await db.queryIBS(query, []);
        }
      }

      if (amount > 0) {
        tax = amount * .1;
        billAmount = amount + tax;
      }

      let query = `insert into kickback_history (bill_no , customer_code , date_bill , date_payment , bill_term_start , bill_term_end , bill_period ,
        bill_minute , bill_rate , bill_amount , amount , tax , disc_amount , date_insert , name_insert , date_update , name_update , paid_flag ,
         obic_flag, call_count) VALUES('${bill_no}', '${customer_id}', '${year}-${month}-01', '${year}-${month}-25','${year}-${month}-01', '${year}-${month}-${numerOfDays}',
         '1' ,'${duration}',0,'${billAmount}','${amount}','${tax}','0','now()','System','now()','System',
        '0','0','${call_count}')`;
      console.log("query==" + query);

      let insertHisDataFC = await db.queryIBS(query, []);






    } catch (error) {
      console.log("Error in result ---" + error.message);
      return error;
    }
  },

  createSummaryData: async function (bill_no, customer_id, year, month, ratesInfo, data) {
    console.log("summary" + JSON.stringify(ratesInfo));

    console.log(ratesInfo[0]['minute_rate']);
    let numerOfDays = new Date(year, month, 0).getDate();

    try {

      let duration = 0;
      let call_count = 0;

      for (let j = 0; j < data.length; j++) {
        let tmp = parseInt(data[j]['total_duration'], 10);
        if (tmp > 0) {
          duration = duration + parseInt(tmp / 60, 10)
        }
        //duration = duration + parseInt(data[j]['total_duration']);
        call_count++;
      }

      // if (duration > 0) {
      //   duration = parseInt(duration/60);
      // }

      let amount = duration * ratesInfo[0]['minute_rate'];
      let tax = amount * .1;
      let billAmount = amount + tax;
      let discAmount = 0;



      let query = `insert into kickback_history (bill_no , customer_code , date_bill , date_payment , bill_term_start , bill_term_end , bill_period ,
           bill_minute , bill_rate , bill_amount , amount , tax , disc_amount , date_insert , name_insert , date_update , name_update , paid_flag ,
            obic_flag, call_count) VALUES('${bill_no}', '${ratesInfo[0]['customer_id']}', '${year}-${month}-01', '${year}-${month}-25','${year}-${month}-01', '${year}-${month}-${numerOfDays}',
            '1' ,'${duration}','${ratesInfo[0]['minute_rate']}','${billAmount}','${amount}','${tax}','${discAmount}','now()','System','now()','System',
           '0','0','${call_count}')`;
      console.log("query==" + query);
      let insertBillingdetailsRes = await db.queryIBS(query, []);



    } catch (error) {
      console.log("Error---" + error.message);
      return error;
    }
  },

  insertByBatches: async function (records, ratesData) {

    console.log("start inserting....");

    let res = [];
    let resArr = [];
    let ipsRates, JSON_data, chunkArray;
    try {
      ipsRates = await getRates('00000130', '', ratesData);
      JSON_data = Object.values(JSON.parse(JSON.stringify(records)));
      chunkArray = chunk(JSON_data, BATCH_SIZE);

      for (let i = 0; i < chunkArray.length; i++) {
        const data = await getNextInsertBatch(chunkArray[i], ipsRates, ratesData);
        res = await db.queryBatchInsert(data, CDR_SONUS_BILLING_CS);
        resArr.push(res);
      }
    } catch (err) {
      console.log("Error: " + err.message);
    }

    console.log("done" + new Date());
    console.log(resArr);
    return resArr;

  },
  genrateInvoice: async function (customerId, serviceType, billingYear, billingMonth, currentMonth, term_use, bill_no) {
    try {

      const invoiceData = await getInvoiceData(customerId, serviceType, billingYear, billingMonth, term_use, bill_no);
      const customerAddress = await getCustomerInfo(customerId);
      
      let path;
      if (customerId == '00000697' || customerId == '00000893') {
        path = __dirname + `\\Invoice\\10${customerId}_${customerAddress[0]['customer_name']}${billingYear}${billingMonth}${bill_no}.pdf`;
      } else {
        path = __dirname + `\\Invoice\\10${customerId}_${customerAddress[0]['customer_name']}${billingYear}${billingMonth}.pdf`;
      }

      let totalCallAmount = 0;
      let totalCallDuration = 0;
      let invoiceNo;
      invoiceData.map(obj => {
        if (serviceType == 'rate_base') {
          totalCallAmount = parseInt(obj.total_amount);
          totalCallDuration = totalCallDuration + parseInt(obj.call_minute);
          invoiceNo = obj.bill_no;
        } else {
          totalCallAmount = totalCallAmount + parseInt(obj.amount);
          totalCallDuration = totalCallDuration + parseInt(obj.call_sec);
          invoiceNo = obj.bill_no;
        }

      });
      await createInvoice(customerId, serviceType, billingYear, billingMonth, invoiceData, path, totalCallAmount, currentMonth, customerAddress, totalCallDuration, invoiceNo);
      console.log("Done...")
    } catch (err) {
      console.log("error...." + err.message);
    }

  },
  sendNotofication: async function (customerName, billingYear, billingMonth, currentMonth) {
    let subject = `Approval Notification for ${reqData.customer_name} of ${utility.dateVsMonths[reqData.billing_month]}`;
    let html = `<div>
      <div> Hi Team, </div>
      <div> Below is the billing status of ${reqData.customer_name} Sonus Outbound. This is approved by ${reqData.approved_by}.</div>
      <div> Thank you </div>
  </div>`;

    let mailOption = {
      from: 'ips_tech@sysmail.ipsism.co.jp',
      to: 'uday@ipsism.co.jp',
      //cc:'r_chong@ipsism.co.jp,y_ito@ipsism.co.jp',
      subject,
      html
    }

    utility.sendEmail(mailOption);
  },
}



async function combineTwoArray(arr1, arr2) {

  console.log("arr1" + JSON.stringify(arr1));
  console.log("arr2" + JSON.stringify(arr2));
  let arr3 = arr1.concat(arr2);
  return arr3;

}

async function getDistinctCompCode(data) {
  let res = {};
  for (let i = 0; i < data.length; i++) {

    if (!res.hasOwnProperty(data[i]['company_code'])) {
      res[data[i]['company_code']] = 1;
    }
  }
  return Object.keys(res);
}


async function getDistinctCarrierCode(data, company_code) {
  let res = {};
  for (let i = 0; i < data.length; i++) {

    if (!res.hasOwnProperty(data[i]['carrier_code']) && data[i]['company_code'] == company_code) {
      res[data[i]['carrier_code']] = 1;
    }
  }
  return Object.keys(res);
}

async function getResInfo(data, ratesInfo, carrierInfo, billingMonth, service_type, lineCounter) {

  console.log("company_code==" + data['company_code']);
  console.log("carrier_code==" + data['carrier_code']);
  console.log("term_carrier_id==" + data['term_carrier_id']);


  let res = [], case1 = {}, case2 = {}, case3 = {}, case4 = {}, case5 = {}, case6 = {};
  let callCountCase1 = 0, durationCase2 = 0, durationCase3 = 0, callCountCase4 = 0, durationCase5 = 0, durationCase6 = 0;
  try {

    let rate = await getKickbackRates(ratesInfo, data['company_code']);
    let carrierName = await getCarrierName(carrierInfo, data['carrier_code']);
    let termCarrierName = await getCarrierName(carrierInfo, data['term_carrier_id']);

    case1['call_count'] = data['total_calls'];
    case1['line_no'] = lineCounter * 6 + 1;;
    case1['item_type'] = 1;
    case1['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 通話回数（国内）";
    case1['call_sec'] = 0;
    case1['amount'] = data['total_calls'] * rate['rate_setup'];
    case1['rate'] = rate['rate_setup'];
    case1['remarks'] = data['term_carrier_id'] + billingMonth + "月分着信";

    case2['call_count'] = data['total_duration'];
    case2['line_no'] = lineCounter * 6 + 2;
    case2['item_type'] = 2;
    case2['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 通話秒数（国内）";
    case2['call_sec'] = data['total_duration'];
    case2['amount'] = data['total_duration'] * rate['rate_sec'];
    case2['rate'] = rate['rate_sec'];
    case2['remarks'] = data['term_carrier_id'] + billingMonth + "月分着信";



    case3['line_no'] = lineCounter * 6 + 3;
    case3['item_type'] = 3;

    case3['call_sec'] = data['total_duration'];
    if (service_type == 'rate_base_with_facility') {
      case3['item_name'] = data['carrier_code'] + "-" + carrierName + "他社設備利用料（国内）";
      case3['amount'] = -(parseFloat(data['total_duration']) * 0.003);
      case3['rate'] = '-0.003';
      case3['call_count'] = data['total_duration'];
    } else {
      case3['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 トランクポート接続料（国内）";
      case3['call_count'] = 0;
      case3['amount'] = 0;
      case3['rate'] = rate['rate_trunk_port'];
    }



    case3['remarks'] = data['term_carrier_id'] + billingMonth + "月分着信";

    case4['call_count'] = 0;
    case4['line_no'] = lineCounter * 6 + 4;
    case4['item_type'] = 1;
    case4['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 通話回数（国内）";
    case4['call_sec'] = 0;
    case4['amount'] = 0 * rate['rate_setup'];
    case4['rate'] = rate['rate_setup'];
    case4['remarks'] = data['term_carrier_id'] + "着信" + billingMonth + "月分着信";

    case5['call_count'] = 0;
    case5['line_no'] = lineCounter * 6 + 5;
    case5['item_type'] = 2;
    case5['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 通話秒数（国内）";
    case5['call_sec'] = 0;
    case5['amount'] = 0 * rate['rate_sec'];
    case5['rate'] = rate['rate_sec'];
    case5['remarks'] = data['term_carrier_id'] + "着信" + billingMonth + "月分着信";


    case6['call_count'] = 0;
    case6['line_no'] = lineCounter * 6 + 6;
    case6['item_type'] = 3;
    case6['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 トランクポート接続料（国内）";
    case6['call_sec'] = 0;
    case6['amount'] = 0;
    case6['rate'] = rate['rate_trunk_port'];
    case6['remarks'] = data['term_carrier_id'] + "着信" + billingMonth + "月分着信";

    res.push(case1);
    res.push(case2);
    res.push(case3);
    res.push(case4);
    res.push(case5);
    res.push(case6);

  } catch (err) {
    console.log("error in get res..." + err.message);
  }

  return res;
}

async function getCarrierName(data, carrier_code) {

  try {
    for (let i = 0; i < data.length; i++) {
      if (data[i]['carrier_code'] == carrier_code) {
        return data[i]['carrier_name'];
      }
    }

  } catch (err) {
    console.log("err in get carrier name=" + err.message)
  }

  return "";
}



async function getKickbackRates(data, company_code) {
  let res = {};

  console.log("comp code==" + company_code);
  console.log("data==" + data.length);

  try {
    for (let i = 0; i < data.length; i++) {
      if (data[i]['company_code'] == company_code) {
        res['rate_setup'] = data[i]['rate_setup'];
        res['rate_sec'] = data[i]['rate_second'];
        res['rate_trunk_port'] = data[i]['rate_trunk_port'];
        break;
      }
    }

  } catch (err) {
    console.log("error in get rates");
  }

  return res;
}


async function getCustomerInfo(customerId) {
  try {
    const query = `select * from m_customer where customer_cd='${customerId}'`;
    const ratesRes = await db.query(query, [], true);

    if (ratesRes.rows) {
      return (ratesRes.rows);
    }

  } catch (error) {
    return error;
  }
}

async function getInvoiceData(customerId, serviceType, year, month, term_use, bill_no) {
  try {
    let query = "";
    if (serviceType == 'rate_base') {

      if (customerId == '00000893') {
        query = `select * from (select bill_no, item_name, call_minute from kickback_detail where call_minute>0)as lj join 
    (select bill_no, customer_code, date_bill , amount as total_amount from kickback_history 
      where customer_code='${customerId}' and bill_no='${bill_no}'   and to_char(date_bill, 'MM-YYYY') =  '${month}-${year}' ) as rj
       on (lj.bill_no=rj.bill_no) order by lj.item_name` ;
      } else {
        query = `select * from (select bill_no, item_name, call_minute from kickback_detail where call_minute>0)as lj join 
        (select bill_no, customer_code, date_bill , amount as total_amount from kickback_history 
          where customer_code='${customerId}'   and to_char(date_bill, 'MM-YYYY') =  '${month}-${year}' ) as rj
           on (lj.bill_no=rj.bill_no) order by lj.item_name` ;
      }


    } else {
      if (customerId == '00000697') {
        query = ` select * from (select bill_no, item_name, call_count, rate, remarks, amount, line_no from kickback_detail_irregular 
          where   amount::int!=0 and  bill_no='${bill_no}')as lj join 
        (select bill_no, customer_code, date_bill  from kickback_history 
        where customer_code='${customerId}' and bill_no='${bill_no}'   and to_char(date_bill, 'MM-YYYY') =  '${month}-${year}') as rj
         on (lj.bill_no=rj.bill_no) order by lj.line_no`  ;
      } else {
        query = ` select * from (select bill_no, item_name, call_count, rate, remarks, amount, line_no from kickback_detail_irregular 
        where   amount::int!=0)as lj join 
      (select bill_no, customer_code, date_bill  from kickback_history 
      where customer_code='${customerId}'   and to_char(date_bill, 'MM-YYYY') =  '${month}-${year}') as rj
       on (lj.bill_no=rj.bill_no) order by lj.line_no`  ;
      }
    }

    const ratesRes = await db.queryIBS(query, []);

    if (ratesRes.rows) {
      return (ratesRes.rows);
    }

  } catch (error) {
    return error;
  }
}





async function createInvoice(customerId, serviceType, billingYear, billingMonth, invoice, path, subTotal, currentMonth, address, totalCallDuration, invoiceNo) {

  let tax = parseInt(subTotal * .1);
  let totalCallAmount = parseInt(subTotal) + (tax);
  let doc = new PDFDocument({ margin: 50 });
  let MAXY = doc.page.height - 50;
  let fontpath = (__dirname + '\\..\\..\\controllers\\font\\ipaexg.ttf');

  doc.font(fontpath);
  await generateHeader(address, doc, totalCallAmount, serviceType);

  let y = generateCustomerInformation(customerId, billingYear, billingMonth, doc, invoice, 210, currentMonth, totalCallAmount, invoiceNo);

  // drawLine(doc, 208);


  console.log("y=--" + y);
  let compType, compTypeJ;
  if (serviceType == 'rate_base') {
    drawLine(doc, y + 25);
    addTableHeader(doc, 50, y + 40, totalCallAmount, totalCallDuration, billingYear, billingMonth);
    y = customTable(doc, y + 85, invoice, MAXY);
    compType = "IPS Pro, Inc.";
    compTypeJ= "アイ・ピー・エス・プロ";
  } else {
    addTableHeaderFC(doc, 50, y + 40, totalCallAmount, totalCallDuration, billingYear, billingMonth);
    y = await customTableFC(doc, y + 50, invoice, MAXY);
    compType = "ELI";
    compTypeJ = "ELI";
  }

  y = await tableSummary(doc, 350, y, subTotal);
  await generateFooter(doc, y, compType, compTypeJ);
  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

async function tableSummary(doc, x, y, subTotal) {

  let tax = parseInt(subTotal * .1);
  let totalCallAmount = parseInt(subTotal) + (tax);

  doc
    .fontSize(8)

    .text(`小合計 (Sub-Total)`, x + 50, y + 20, { width: 100, align: "left" })

    .text(`消費税 (Tax)`, x + 50, y + 35, { width: 100, align: "left" })

  doc.rect(380, y + 15, 110, 15).stroke()
  doc.rect(380, y + 30, 110, 15).stroke()
  doc.rect(380, y + 45, 110, 15).stroke()


  doc.rect(490, y + 15, 70, 15).stroke()
  doc.rect(490, y + 30, 70, 15).stroke()
  doc.rect(490, y + 45, 70, 15).stroke()

    //drawLine(doc, y + 48, x + 50, 500)

    .text(`合計 (Total Amount)`, x + 50, y + 50, { width: 100, align: "left" })
    .text(`¥${utility.numberWithCommas(subTotal)}`, x + 100, y + 20, { width: 110, align: "right" })
    .text(`¥${utility.numberWithCommas(tax)}`, x + 100, y + 35, { width: 110, align: "right" })
    .text('¥' + utility.numberWithCommas(totalCallAmount), x + 100, y + 50, { width: 110, align: "right" })

    //doc.rect(385,  y+45, 100 ,15   ).stroke()  
    // doc.rect(485,  y+60, 65 ,15   ).stroke()


    .moveDown();
  return y + 100;
}

async function generateHeader(customerDetails, doc, totalCallAmount, serviceType) {

  let postNumber = customerDetails[0]['post_number'];
  let customerName = customerDetails[0]['customer_name'];
  let address = customerDetails[0]['address'];

  let ElIAddress1, ELIPostNumber, ElIAddress2, ElIAddress3, ELIPhone, ELIFax;

  if (serviceType == 'rate_base') {
    ElIAddress1 = "株式会社アイ・ピー・エス・プロ";
    ELIPostNumber = "〒104-0061";
    ElIAddress2 = "東京都中央区銀座4-12-15";
    ElIAddress3 = "歌舞伎座タワー8F";
    ELIPhone = "TEL: 03-3549-7626";
    ELIFax = "FAX : 03-3545-7331";
  } else {
    ElIAddress1 = "株式会社ELI";
    ELIPostNumber = "〒100-0005";
    ElIAddress2 = "東京都千代田区丸の内1-8-3";
    ElIAddress3 = "丸の内トラストタワー本館20F";
    ELIPhone = "TEL 03-5288-5192";
    ELIFax = "FAX 03-5288-5193";
  }

  doc
    // .image("logo.png", 50, 45, { width: 50 })
    //.fillColor("#444444")
    .fontSize(10)
    .text(`〒${postNumber}`, 50, 57)
    .text(`${address}`, 50, 70)
    .text(`${customerName} 御中`, 50, 83)


    .text(`${ElIAddress1}`, 10, 57, { align: "right" })
    .text(`${ELIPostNumber}`, 10, 70, { align: "right" })
    .text(`${ElIAddress2}`, 10, 83, { align: "right" })
    .text(`${ElIAddress3}`, 10, 96, { align: "right" })
    .text(`${ELIPhone}`, 10, 109, { align: "right" })
    .text(`${ELIFax}`, 10, 122, { align: "right" })


    .text("手 数 料 計 算 書", 50, 142, { align: "center" })
    .text("Commission Payment Details", 50, 153, { align: "center" })

    // .text("下記のとおりご請求申し上げます。", 50, 170)
    // .text(`ご請求金額合計 (Total Amount):  ${utility.numberWithCommas(totalCallAmount)}`, 50, 170, { align: "right" })

    .moveDown();

}

async function generateFooter(doc, y, compType, compTypeJ) {
  console.log("in footer")
  doc
    .fontSize(8)
    .text(`※この書類は㈱${compTypeJ}から御社にお支払いする手数料についての通知書です。`, 50, y + 50)
    .moveDown()
    .text("内容をご確認の上、請求書を上記住所までご送付くださいますようお願いいたします。")
    .moveDown()
    .text(`This serves as the notice of commission details to be paid by ${compType} to your company.`)
    .moveDown()
    .text(`Kindly issue to ${compType} an invoice statement upon receipt of this notice by sending to address above.`)
    .moveDown()

}

function row(doc, heigth) {
  doc.lineJoin('miter')
    .rect(33, heigth, 560, 40)
    .stroke()
  return doc
}

function customTable(doc, y, data, MAXY) {

  let height = y + 15;
  let length = data.length;
  for (let i = 0; i < data.length; i++) {



    textInRowFirst(doc, data[i].item_name, 50, height, "center", 250);
    textInRowFirst(doc, utility.numberWithCommas(parseInt(data[i].call_minute)), 300, height, "right", 260);

    height = height + 20;
    if (height >= 680) {
      doc.addPage({ margin: 50 })
      height = 50;
      //addTableHeader(doc, 50, 50);

    }
  }
  return height;
}

async function customTableFC(doc, y, data, MAXY) {
  console.log("in table FC");
  let height = y;
  for (let i = 0; i < data.length; i++) {
    height = height + 20;
    textInRowFirst(doc, i + 1, 50, height, "center", 15);
    textInRowFirst(doc, data[i].item_name, 65, height, null, 265);
    textInRowFirst(doc, data[i].rate, 330, height, "right", 50);
    textInRowFirst(doc, utility.numberWithCommas(parseInt(data[i].call_count)), 380, height, "right", 60);
    textInRowFirst(doc, utility.numberWithCommas(parseInt(data[i].amount)), 440, height, "right", 50);
    textInRowFirst(doc, data[i].remarks, 490, height, "right", 70);
    // textInRowFirst(doc, utility.numberWithCommas(parseInt(data[i].total_amount)), 400, height, "right");

    if (height >= 680) {
      doc.addPage({ margin: 50 })
      height = 50;
      //addTableHeader(doc, 50, 50);

    }
  }
  return height;
}

function addTableHeader(doc, x, y, totalAmount, totalCallDuration, billingYear, billingMonth) {

  doc
    .fontSize(10)
    .text(`サービス品目`, 50, y, { width: 100, align: "center" })
    .text(`手数料種類`, 150, y, { width: 100, align: "center" })
    .text(`着信時間（分数）`, 250, y, { width: 100, align: "center" })
    .text(`計算期間`, 350, y, { width: 100, align: "center" })
    .text(`手数料`, 450, y, { width: 110, align: "center" })

  doc.rect(50, y - 5, 100, 30).stroke()
  doc.rect(150, y - 5, 100, 30).stroke()
  doc.rect(250, y - 5, 100, 30).stroke()
  doc.rect(350, y - 5, 100, 30).stroke()
  doc.rect(450, y - 5, 110, 30).stroke()

    .text(`SERVICE ITEM`, 50, y + 10, { width: 100, align: "center" })
    .text(`COMMISSION TYPE`, 150, y + 10, { width: 100, align: "center" })
    .text(`TIME (MIN)`, 250, y + 10, { width: 100, align: "center" })
    .text(`PERIOD`, 350, y + 10, { width: 100, align: "center" })
    .text(`COMMISSION FEE`, 450, y + 10, { width: 110, align: "center" })


    //drawLine(doc, y)
    .fontSize(8)
    .text(`音声着信サービス`, 50, y + 30, { width: 100, align: "center" })
    .text(`1ヶ月間の累積着信分数`, 150, y + 30, { width: 100, align: "center" })
    .text(`${utility.numberWithCommas(totalCallDuration)}`, 250, y + 30, { width: 100, align: "center" })
    .text(`${billingYear}/${billingMonth}/1 ～ ${billingYear}/${billingMonth}/${daysInMonth(billingMonth, billingYear)}`, 350, y + 30, { width: 100, align: "center" })
    .fontSize(16)
    .text(`¥${utility.numberWithCommas(totalAmount)}`, 450, y + 30, { width: 110, align: "center" })
    .fontSize(8)
    .text(`Voice Receiver Service`, 50, y + 42, { width: 100, align: "center" })
    .text(`1 Month(s) Accumulative`, 150, y + 42, { width: 100, align: "center" })

  doc.rect(50, y + 25, 100, 30).stroke()
  doc.rect(150, y + 25, 100, 30).stroke()
  doc.rect(250, y + 25, 100, 30).stroke()
  doc.rect(350, y + 25, 100, 30).stroke()
  doc.rect(450, y + 25, 110, 30).stroke()


    //drawLine(doc, y + 22)
    .moveDown();
}

function addTableHeaderFC(doc, x, y, totalAmount, totalCallDuration, billingYear, billingMonth) {
  console.log("y---" + y);

  doc
    .fontSize(10)
    .text(`No`, 50, y, { width: 15, align: "center" })
  doc.rect(50, y - 5, 15, 30).stroke()
    .text(`内訳 (DETAILS) `, 65, y, { width: 265, align: "center" })
  doc.rect(65, y - 5, 265, 30).stroke()
    .text(`単価 (PRICE)`, 330, y, { width: 50, align: "center" })
  doc.rect(330, y - 5, 50, 30).stroke()
    .text(`数量 (QUANTITY)`, 380, y, { width: 60, align: "center" })
  doc.rect(380, y - 5, 60, 30).stroke()
    .text(`金額 (TOTAL)`, 440, y, { width: 50, align: "center" })
  doc.rect(440, y - 5, 50, 30).stroke()
    .text(`備考 (REMARKS)`, 490, y, { width: 70, align: "center" })
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


function generateCustomerInformation(customerId, billingYear, billingMonth, doc, invoice, y, currentMonth, totalAmount, invoiceNo) {

  const currentYear = new Date(currentMonth).getFullYear();
  let currentMonthValue = new Date(currentMonth).getMonth() + 1;
  if (parseInt(currentMonthValue, 10) < 10) {
    currentMonthValue = '0' + currentMonthValue;
  }


  doc
    .text(`お客様コード番号`, 50, y, { width: 100, align: "center" })
    .text(`請求書番号`, 150, y, { width: 100, align: "center" })
    .text(`発行年月日`, 250, y, { width: 100, align: "center" })
    .text(`ご利用期間`, 350, y, { width: 100, align: "center" })
    .text(`コミッション額`, 450, y, { width: 110, align: "center" })


    .text(`Customer Code`, 50, y + 10, { width: 100, align: "center" })
    .text(`Invoice Number`, 150, y + 10, { width: 100, align: "center" })
    .text(`Date of Issue`, 250, y + 10, { width: 100, align: "center" })
    .text(`Used Period`, 350, y + 10, { width: 100, align: "center" })
    .text(`COMMISSION FEE`, 450, y + 10, { width: 110, align: "center" })

  doc.rect(50, y - 5, 100, 30).stroke()
  doc.rect(150, y - 5, 100, 30).stroke()
  doc.rect(250, y - 5, 100, 30).stroke()
  doc.rect(350, y - 5, 100, 30).stroke()
  doc.rect(450, y - 5, 110, 30).stroke()


    .fontSize(8)
    .text(`${customerId}`, 50, y + 30, { width: 100, align: "center" })
    .text(`${invoiceNo}`, 150, y + 30, { width: 100, align: "center" })
    .text(`${currentYear}/${currentMonthValue}/01`, 250, y + 30, { width: 100, align: "center" })
    .text(`${billingYear}/${billingMonth}/01 ～ ${billingYear}/${billingMonth}/${daysInMonth(billingMonth, billingYear)}`, 350, y + 30, { width: 100, align: "center" })
    .fontSize(12)
    .text(`¥${utility.numberWithCommas(totalAmount)}`, 450, y + 30, { width: 110, align: "center" })
    .fontSize(8)
  doc.rect(50, y + 25, 100, 25).stroke()
  doc.rect(150, y + 25, 100, 25).stroke()
  doc.rect(250, y + 25, 100, 25).stroke()
  doc.rect(350, y + 25, 100, 25).stroke()
  doc.rect(450, y + 25, 110, 25).stroke()

    .moveDown();
  return y + 35;
}

function drawLine(doc, startX, Y = 50, Z = 560) {
  doc
    .moveTo(Y, startX)                            // set the current point
    .lineTo(Z, startX)                            // draw a line
    .stroke();
  return doc;                                // stroke the path
}




async function getRates(companyCode, carrierCode, ratesData) {

  let resData = [];
  try {
    for (let i = 0; i < ratesData.length; i++) {
      if (carrierCode && companyCode) {
        if (ratesData[i]['carrier_code'] == carrierCode && ratesData[i]['company_code'] == companyCode) {
          resData['rateId'] = ratesData[i]['rate_id'];
          resData['rateSetup'] = ratesData[i]['rate_setup'];
          resData['rateSecond'] = ratesData[i]['rate_second'];
          break;
        }
      } else if (companyCode) {
        if (ratesData[i]['company_code'] == companyCode) {
          resData['rateId'] = ratesData[i]['rate_id'];
          resData['rateSetup'] = ratesData[i]['rate_setup'];
          resData['rateSecond'] = ratesData[i]['rate_second'];
          break;
        }
      }
    }
  } catch (err) {
    console.log("Error " + err.message);
    return err;
  }
  return resData;
}





async function getNextInsertBatch(data, ipsRates, ratesData) {

  let valueArray = [];

  try {
    for (let i = 0; i < data.length; i++) {

      let obj = {};
      if (data[i]['term_carrier_id'] == '2GSX' || data[i]['term_carrier_id'] == 'AN,0') {
        data[i]['term_carrier_id'] = '5039';
      }

      const rates = await getRates(data[i]['billing_comp_code'], data[i]['term_carrier_id'], ratesData);

      //  console.log("rates=="+(rates));
      //console.log("rates Id=="+(rates['rateId']));

      const blegCallAmount = parseFloat(rates['rateSetup']) + (parseFloat(data[i]['duration_use']) * parseFloat(rates['rateSecond']));
      const ipsCallAmount = parseFloat(ipsRates['rateSetup']) + (parseFloat(data[i]['duration_use']) * parseFloat(ipsRates['rateSecond']));
      const totalCallAmount = (ipsCallAmount + blegCallAmount).toFixed(2);
      obj['cdr_id'] = data[i]['cdr_id'];
      obj['rate_id'] = rates['rateId'];
      obj['bill_number'] = '1';
      obj['bill_date'] = 'now()';
      obj['bleg_call_amount'] = blegCallAmount;
      obj['ips_call_amount'] = ipsCallAmount;
      obj['total_amount'] = totalCallAmount;
      obj['remarks'] = 're';

      if (rates['rateId'] == null || rates['rateId'] == '' || rates['rateId'] == 'null') {
        console.log(JSON.stringify(data[i]));
      }
      valueArray.push(obj);

    }
  } catch (err) {
    console.log("err" + err.message);
  }
  //console.log("actual data=="+JSON.stringify(valueArray))
  return valueArray;

}


function chunk(array, size) {

  // console.log("chunk"+size);

  const chunked_arr = [];
  let copied = [...array]; // ES6 destructuring
  const numOfChild = Math.ceil(copied.length / size); // Round up to the nearest integer
  for (let i = 0; i < numOfChild; i++) {
    chunked_arr.push(copied.splice(0, size));
  }
  return chunked_arr;
}


function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}


