var utility = require('../../public/javascripts/utility');
var db = require('./../../config/database');
var PDFDocument = require("pdfkit");
var fs = require("fs");

var common = require('./../common/common')


module.exports = {
  getRates: async function () {
    try {
      const query = `select carrier_code,term_carrier_code, date_start, date_expired, rate_setup, rate_second, rate_trunk_port, company_code from carrier where deleted =false`;
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
  getIPRates: async function () {
    try {
      const query = `select id, host_name, company_code, typeof_call, rate_setup, rate_trunk_port,
       rate_second from ipdata_rate where deleted = false`;
      const ratesIPRes = await db.queryIBS(query, []);

      // console.log("ratesRes="+JSON.stringify(ratesRes.rows));

      if (ratesIPRes.rows) {
        // console.log("if")
        return (ratesIPRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get rates =" + error.message);
      return error;
    }
  },
  getCarrierInfo: async function () {
    try {
      const query = `select carrier_code, term_carrier_code, carrier_name, company_code from carrier where deleted = false`;
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
      const query = `select max(bill_no) as max_bill_no from bill_history `;
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

  getNewBillNoInfo: async function () {
    try {
      const query = `select max(bill_no) as max_bill_no from bill_history_new `;
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


  getAllCompCode: async function (year, month) {
    try {
      console.log("in get all comp code");
      const query = `select distinct(company_code) as company_code from billcdr_${year}${month}  
      where company_code not in ('9999999999')
      order by company_code `;
      const billNoRes = await db.queryIBS(query, []);
      return billNoRes.rows;
    } catch (error) {
      console.log("err in getting company code =" + error.message);
      return error;
    }
  },


  getAllCompCodeNewData: async function (year, month) {
    try {
      console.log("in get all comp code");
      
      let query = `select distinct(company_code) as company_code from cdr_${year}${month}_new   
      where company_code in  ('1011000065')  order by company_code `;

      // query = `select distinct(company_code) as company_code from cdr_${year}${month}_new   
      // where company_code ='1011000058'
      // order by company_code `;

      const billNoRes = await db.queryIBS(query, []);
      return billNoRes.rows;
    } catch (error) {
      console.log("err in getting company code =" + error.message);
      return error;
    }
  },


  getTargetDate: async function (date_id) {
    try {
      const query = `SELECT max(date_set)::date - interval '1 month' as target_billing_month, max(date_set)::date as current_montth 
       FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
      const targetDateRes = await db.query(query, []);
      //console.log(targetDateRes);
      if (targetDateRes.rows) {
        return { 'target_billing_month': (targetDateRes.rows[0].target_billing_month), 'current_month': (targetDateRes.rows[0].current_montth) };
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get target cdr =" + error.message);
      return error;
    }
  },

  getTargetCDR: async function (company_code, year, month) {
    try {
      query = `select count(*) as total_calls,  trunc(sum(duration), 0) as total_duration , carrier_code, term_carrier_id 
          from billcdr_${year}${month} where duration>1 and company_code='${company_code}' group by carrier_code, term_carrier_id 
          order by carrier_code, term_carrier_id `;

     // console.log("query==" + query);
      const data = await db.queryIBS(query);

      return data.rows;
    } catch (error) {
      console.log("error in get cdr data=" + error.message);
      return error;
    }
  },


  getNewIPDataTargetCDR: async function (company_code, year, month) {

    try {
      query = `select count(*) as total_calls,  trunc(sum(duration_use::numeric), 0) as total_duration , 
       orig_ioi ,  term_ioi from 
      cdr_${year}${month}_new 
      where  company_code='${company_code}' and cpc!='test'
     
      group by orig_ioi ,term_ioi
      order by term_ioi, term_ioi `;

      console.log("query==" + query);
      const data = await db.queryIBS(query);

      return data.rows;
    } catch (error) {
      console.log("error in get cdr data=" + error.message);
      return error;
    }
  },
  getNewDataTargetCDR: async function (company_code, year, month) {

    try {
      query = `select count(*) as total_calls,  trunc(sum(duration_use::numeric), 0) as total_duration , 
      orig_carrier_id as carrier_code, term_carrier_id , split_part(calling_type,'.',1) as calling_type from 
      cdr_${year}${month}_new 
      where  company_code='${company_code}' and cpc!='test'
     
      group by orig_carrier_id, term_carrier_id ,split_part(calling_type,'.',1)
      order by orig_carrier_id, term_carrier_id `;

      console.log("query==" + query);
      const data = await db.queryIBS(query);

      return data.rows;
    } catch (error) {
      console.log("error in get cdr data=" + error.message);
      return error;
    }
  },


  createDetailData: async function (bill_no, company_code, year, month, ratesDetails, data, carrierInfo) {
    console.log("details ");
    let numerOfDays = new Date(year, month , 0). getDate();
    try {

      let call_count = 0;
      let duration = 0;
      let amount = 0;
      let billAmount = 0;
      let tax = 0;


      for (let i = 0; i < data.length; i++) {
        let info = await getResInfo(data[i], company_code, ratesDetails, carrierInfo, month, i);

        for (let ii = 0; ii < info.length; ii++) {

          call_count = call_count + parseInt(info[ii]['call_count'], 10);
          duration = duration + parseInt(info[ii]['call_sec'], 10);
          if (parseInt(info[ii]['amount'], 10) >= 1) {
            amount = amount + parseInt(info[ii]['amount'], 10);
          }
          let query = `insert into bill_detail (bill_no,line_no, item_type , item_name, call_count, call_sec,rate,
                amount, remarks, date_update, name_update, date_insert, name_insert) VALUES('${bill_no}', '${info[ii]['line_no']}', 
                '${info[ii]['item_type']}', '${info[ii]['item_name']}',${info[ii]['call_count']}, ${info[ii]['call_sec']}, ${info[ii]['rate']} 
                ,${info[ii]['amount']},'${info[ii]['remarks']}','now()','system', 'now()','system')`;

          //console.log("query==" + query);
          await db.queryIBS(query, []);
        }
      }

      if (amount > 0) {
        tax = amount * .1; // 10% tax
        billAmount = amount + tax;
      }

      let query = `insert into bill_history (bill_no , company_code , date_bill , date_payment , bill_term_start , bill_term_end , bill_period ,
         amount , tax ,print_flag , date_insert , name_insert , date_update , name_update , bill_include ,call_count) VALUES('${bill_no}', '${company_code}', '${year}-${month}-01', '${year}-${month}-25','${year}-${month}-01', '${year}-${month}-${numerOfDays}',
         '1' ,'${amount}','${tax}','0','now()','System','now()','System', '0','${call_count}')`;
      //console.log("query==" + query);

      await db.queryIBS(query, []);
    } catch (error) {
      console.log("Error in result ---" + error.message);
      return error;
    }
  },

  createNewIPDetailData: async function (bill_no, company_code, year, month, ratesIPDetails, data) {
    console.log("details ");
    let numerOfDays = new Date(year, month , 0). getDate();
    try {

      let call_count = 0;
      let duration = 0;
      let amount = 0;
      let billAmount = 0;
      let tax = 0;


      for (let i = 0; i < data.length; i++) {
        let info = await getResInfoNewIPData(data[i], company_code, ratesIPDetails, month, i);

        for (let ii = 0; ii < info.length; ii++) {

          call_count = call_count + parseInt(info[ii]['call_count'], 10);
          duration = duration + parseInt(info[ii]['call_sec'], 10);
          if (parseInt(info[ii]['amount'], 10) >= 1) {
            amount = amount + parseInt(info[ii]['amount'], 10);
          }
          let query = `insert into bill_detail_new (bill_no,line_no, item_type , item_name, call_count, call_sec,rate,
                amount, remarks, date_update, name_update, date_insert, name_insert) VALUES('${bill_no}', '${info[ii]['line_no']}', 
                '${info[ii]['item_type']}', '${info[ii]['item_name']}',${info[ii]['call_count']}, ${info[ii]['call_sec']}, ${info[ii]['rate']} 
                ,${info[ii]['amount']},'${info[ii]['remarks']}','now()','system', 'now()','system')`;

          //console.log("query==" + query);
          await db.queryIBS(query, []);
        }
      }

      if (amount > 0) {
        tax = amount * .1; // 10% tax
        billAmount = amount + tax;
      }

      let query = `insert into bill_history_new (bill_no , company_code , date_bill , date_payment , bill_term_start , bill_term_end , bill_period ,
         amount , tax ,print_flag , date_insert , name_insert , date_update , name_update , bill_include ,call_count) VALUES('${bill_no}', '${company_code}', '${year}-${month}-01', '${year}-${month}-25','${year}-${month}-01', '${year}-${month}-${numerOfDays}',
         '1' ,'${amount}','${tax}','0','now()','System','now()','System', '0','${call_count}')`;
      //console.log("query==" + query);

      await db.queryIBS(query, []);
    } catch (error) {
      console.log("Error in result ---" + error.message);
      return error;
    }
  },

  createNewDetailData: async function (bill_no, company_code, year, month, ratesDetails, data, carrierInfo) {
    console.log("details ");
    let numerOfDays = new Date(year, month , 0). getDate();
    try {

      let call_count = 0;
      let duration = 0;
      let amount = 0;
      let billAmount = 0;
      let tax = 0;


      for (let i = 0; i < data.length; i++) {
        let info = await getResInfoNew(data[i], company_code, ratesDetails, carrierInfo, month, i);

        for (let ii = 0; ii < info.length; ii++) {

          call_count = call_count + parseInt(info[ii]['call_count'], 10);
          duration = duration + parseInt(info[ii]['call_sec'], 10);
          if (parseInt(info[ii]['amount'], 10) >= 1) {
            amount = amount + parseInt(info[ii]['amount'], 10);
          }
          let query = `insert into bill_detail_new (bill_no,line_no, item_type , item_name, call_count, call_sec,rate,
                amount, remarks, date_update, name_update, date_insert, name_insert) VALUES('${bill_no}', '${info[ii]['line_no']}', 
                '${info[ii]['item_type']}', '${info[ii]['item_name']}',${info[ii]['call_count']}, ${info[ii]['call_sec']}, ${info[ii]['rate']} 
                ,${info[ii]['amount']},'${info[ii]['remarks']}','now()','system', 'now()','system')`;

          //console.log("query==" + query);
          await db.queryIBS(query, []);
        }
      }

      if (amount > 0) {
        tax = amount * .1; // 10% tax
        billAmount = amount + tax;
      }

      let query = `insert into bill_history_new (bill_no , company_code , date_bill , date_payment , bill_term_start , bill_term_end , bill_period ,
         amount , tax ,print_flag , date_insert , name_insert , date_update , name_update , bill_include ,call_count) VALUES('${bill_no}', '${company_code}', '${year}-${month}-01', '${year}-${month}-25','${year}-${month}-01', '${year}-${month}-${numerOfDays}',
         '1' ,'${amount}','${tax}','0','now()','System','now()','System', '0','${call_count}')`;
      //console.log("query==" + query);

      await db.queryIBS(query, []);
    } catch (error) {
      console.log("Error in result ---" + error.message);
      return error;
    }
  },

  genrateInvoice: async function (company_code, billingYear, billingMonth, currentMonth, newData) {
    try {

      const invoiceData = await getInvoiceData(company_code, billingYear, billingMonth, newData);
      const customerAddress = await getCustomerInfo(company_code);

      let path = __dirname + `\\Invoice\\1${company_code}${billingYear}${billingMonth}_${customerAddress[0]['company_name']}御中.pdf`;

      let totalCallAmount = 0;
      let totalCallDuration = 0;

      invoiceData.map(obj => {
        totalCallAmount = totalCallAmount + parseInt(obj.amount);
        totalCallDuration = totalCallDuration + parseInt(obj.call_sec);
      });
      await createInvoice(company_code, billingYear, billingMonth, invoiceData, path, totalCallAmount, currentMonth, customerAddress, totalCallDuration);
      console.log("Done...")
    } catch (err) {
      console.log("error...." + err.message);
    }

  },
  sendNotofication: async function (customerName, billingYear, billingMonth, currentMonth) {
    let subject = `Approval Notification for ${reqData.customer_name} of ${utility.dateVsMonths[reqData.billing_month]}`;
    let html = `<div>
      <div> Hi Team, </div>
      <div> Below is the billing status of ${reqData.customer_name} Sougo. This is approved by ${reqData.approved_by}.</div>
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

async function getResInfo(data, company_code, ratesInfo, carrierInfo, billingMonth, lineCounter) {

  console.log("company_code==" + company_code);
  console.log("carrier_code==" + data['carrier_code']);
  console.log("term_carrier_id==" + data['term_carrier_id']);


  let res = [], case1 = {}, case2 = {}, case3 = {}, case4 = {}, case5 = {}, case6 = {};
  try {

    let rate = await getSougoRates(ratesInfo, data['carrier_code'], company_code, data['term_carrier_id']);
    let carrierName = await getCarrierName(carrierInfo, data['carrier_code']);
    let termCarrierName = await getCarrierName(carrierInfo, data['term_carrier_id']);

    case1['call_count'] = data['total_calls'];
    case1['line_no'] = lineCounter * 6 + 1;
    case1['item_type'] = 1;
    case1['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 通話回数（国内）";
    case1['call_sec'] = data['total_calls'];
    case1['amount'] = data['total_calls'] * rate['rate_setup'];
    case1['rate'] = rate['rate_setup'];
    case1['remarks'] = data['term_carrier_id'] + "着信 " + billingMonth + "月分";

    case2['call_count'] = 0;
    case2['line_no'] = lineCounter * 6 + 2;
    case2['item_type'] = 2;
    case2['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 通話秒数（国内）";
    case2['call_sec'] = data['total_duration'];
    case2['amount'] = data['total_duration'] * rate['rate_sec'];
    case2['rate'] = rate['rate_sec'];
    case2['remarks'] = data['term_carrier_id'] + "着信 " + billingMonth + "月分";


    case3['call_count'] = data['total_duration'];
    case3['line_no'] = lineCounter * 6 + 3;
    case3['item_type'] = 3;
    case3['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 ﾄﾗﾝｸﾎﾟｰﾄ接続料（国内）";
    case3['call_sec'] = data['total_duration'];
    case3['amount'] = rate['rate_trunk_port'] * data['total_duration'];
    case3['rate'] = rate['rate_trunk_port'];
    case3['remarks'] = data['term_carrier_id'] + "着信 " + billingMonth + "月分";

    case4['call_count'] = 0;
    case4['line_no'] = lineCounter * 6 + 4;
    case4['item_type'] = 1;
    case4['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 通話回数（国際）"
    case4['call_sec'] = 0;
    case4['amount'] = 0 * rate['rate_setup'];
    case4['rate'] = rate['rate_setup'];
    case4['remarks'] = data['term_carrier_id'] + "着信" + billingMonth + "月分";

    case5['call_count'] = 0;
    case5['line_no'] = lineCounter * 6 + 5;
    case5['item_type'] = 2;
    case5['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 通話秒数（国際）";
    case5['call_sec'] = 0;
    case5['amount'] = 0 * rate['rate_sec'];
    case5['rate'] = rate['rate_sec'];
    case5['remarks'] = data['term_carrier_id'] + "着信" + billingMonth + "月分";


    case6['call_count'] = 0;
    case6['line_no'] = lineCounter * 6 + 6;
    case6['item_type'] = 3;
    case6['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 ﾄﾗﾝｸﾎﾟｰﾄ接続料（国際）";
    case6['call_sec'] = 0;
    case6['amount'] = 0;
    case6['rate'] = rate['rate_trunk_port'];
    case6['remarks'] = data['term_carrier_id'] + "着信" + billingMonth + "月分";


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

async function getResInfoNewIPData (data, company_code, ratesIPInfo, billingMonth, lineCounter) {

  console.log("company_code==" + company_code);
  console.log("carrier_code==" + data['orig_ioi']);
  console.log("term_carrier_id==" + data['term_ioi']);


  let res = [], case1 = {}, case2 = {}, case3 = {}, case4 = {}, case5 = {}, case6 = {};
  try {

    const newOicName = data['term_ioi'].includes('IEEE') ? '0ABJ' : '050IP' ;

    let IPTest2 = "" ;
    if(data['term_ioi']){
      IPTest2Arr = data['term_ioi'].split("-")
      IPTest2= IPTest2Arr[0];
    }


    const rate = await getSougoRatesIPData(ratesIPInfo, data['orig_ioi'], company_code, newOicName);

    console.log("rate.."+ JSON.stringify(rate))

    const IPText = data['orig_ioi'].includes('GSTN')  ? '（メタルIP）' : '' ;
    const IPTest1Arr =  data['orig_ioi'].split(".");


    case1['call_count'] = data['total_calls'];
    case1['line_no'] = lineCounter * 6 + 1;
    case1['item_type'] = 1;
    case1['item_name'] = IPTest1Arr[0] + '-' + IPText + "発信分 通話回数（国内）";
    case1['call_sec'] = data['total_calls'];
    case1['amount'] = data['total_calls'] * rate['rate_setup'];
    case1['rate'] = rate['rate_setup'];
    case1['remarks'] = newOicName + "着信 " + billingMonth + "月分";

    case2['call_count'] = 0;
    case2['line_no'] = lineCounter * 6 + 2;
    case2['item_type'] = 2;
    case2['item_name'] =IPTest1Arr[0] + '-'  + IPText + "発信分 通話秒数（国内）";
    case2['call_sec'] = data['total_duration'];
    case2['amount'] = data['total_duration'] * rate['rate_sec'];
    case2['rate'] = rate['rate_sec'];
    case2['remarks'] = newOicName + "着信 " + billingMonth + "月分";


    case3['call_count'] = data['total_duration'];
    case3['line_no'] = lineCounter * 6 + 3;
    case3['item_type'] = 3;
    case3['item_name'] =IPTest1Arr[0] + '-'   + "発信分 ﾄﾗﾝｸﾎﾟｰﾄ接続料（国内）";
    case3['call_sec'] = data['total_duration'];
    case3['amount'] = rate['rate_trunk_port'] * data['total_duration'];
    case3['rate'] = rate['rate_trunk_port'];
    case3['remarks'] = IPTest2 + "着信 " + billingMonth + "月分";

    case4['call_count'] = 0;
    case4['line_no'] = lineCounter * 6 + 4;
    case4['item_type'] = 1;
    case4['item_name'] = IPTest1Arr[0] + '-'  + "発信分 通話回数（国際）"
    case4['call_sec'] = 0;
    case4['amount'] = 0 * rate['rate_setup'];
    case4['rate'] = rate['rate_setup'];
    case4['remarks'] = newOicName + "着信" + billingMonth + "月分";

    case5['call_count'] = 0;
    case5['line_no'] = lineCounter * 6 + 5;
    case5['item_type'] = 2;
    case5['item_name'] =IPTest1Arr[0] + '-'  + "発信分 通話秒数（国際）";
    case5['call_sec'] = 0;
    case5['amount'] = 0 * rate['rate_sec'];
    case5['rate'] = rate['rate_sec'];
    case5['remarks'] = newOicName + "着信" + billingMonth + "月分";


    case6['call_count'] = 0;
    case6['line_no'] = lineCounter * 6 + 6;
    case6['item_type'] = 3;
    case6['item_name'] =IPTest1Arr[0] + '-' + "発信分 ﾄﾗﾝｸﾎﾟｰﾄ接続料（国際）";
    case6['call_sec'] = 0;
    case6['amount'] = 0;
    case6['rate'] = rate['rate_trunk_port'];
    case6['remarks'] = newOicName + "着信" + billingMonth + "月分";


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

async function getResInfoNew (data, company_code, ratesInfo, carrierInfo, billingMonth, lineCounter) {

  console.log("company_code==" + company_code);
  console.log("carrier_code==" + data['carrier_code']);
  console.log("term_carrier_id==" + data['term_carrier_id']);


  let res = [], case1 = {}, case2 = {}, case3 = {}, case4 = {}, case5 = {}, case6 = {};
  try {

    let rate = await getSougoRates(ratesInfo, data['carrier_code'], company_code, data['term_carrier_id']);
    let carrierName = await getCarrierName(carrierInfo, data['carrier_code']);
    let termCarrierName = await getCarrierName(carrierInfo, data['term_carrier_id']);

    let newOicName = data['term_carrier_id'] == '5039' ? '0ABJ' : '050IP' ;

    let IPText = (data['calling_type'] == 'GSTN' ) ? '（メタルIP）' : '' ;

    case1['call_count'] = data['total_calls'];
    case1['line_no'] = lineCounter * 6 + 1;
    case1['item_type'] = 1;
    case1['item_name'] = data['calling_type'] + '-' + carrierName + IPText + "発信分 通話回数（国内）";
    case1['call_sec'] = data['total_calls'];
    case1['amount'] = data['total_calls'] * rate['rate_setup'];
    case1['rate'] = rate['rate_setup'];
    case1['remarks'] = newOicName + "着信 " + billingMonth + "月分";

    case2['call_count'] = 0;
    case2['line_no'] = lineCounter * 6 + 2;
    case2['item_type'] = 2;
    case2['item_name'] =data['calling_type'] + '-' + carrierName + IPText + "発信分 通話秒数（国内）";
    case2['call_sec'] = data['total_duration'];
    case2['amount'] = data['total_duration'] * rate['rate_sec'];
    case2['rate'] = rate['rate_sec'];
    case2['remarks'] = newOicName + "着信 " + billingMonth + "月分";


    case3['call_count'] = data['total_duration'];
    case3['line_no'] = lineCounter * 6 + 3;
    case3['item_type'] = 3;
    case3['item_name'] = data['calling_type'] + '-' + carrierName  + "発信分 ﾄﾗﾝｸﾎﾟｰﾄ接続料（国内）";
    case3['call_sec'] = data['total_duration'];
    case3['amount'] = rate['rate_trunk_port'] * data['total_duration'];
    case3['rate'] = rate['rate_trunk_port'];
    case3['remarks'] = data['term_carrier_id'] + "着信 " + billingMonth + "月分";

    case4['call_count'] = 0;
    case4['line_no'] = lineCounter * 6 + 4;
    case4['item_type'] = 1;
    case4['item_name'] = data['calling_type'] + '-' + carrierName + "発信分 通話回数（国際）"
    case4['call_sec'] = 0;
    case4['amount'] = 0 * rate['rate_setup'];
    case4['rate'] = rate['rate_setup'];
    case4['remarks'] = newOicName + "着信" + billingMonth + "月分";

    case5['call_count'] = 0;
    case5['line_no'] = lineCounter * 6 + 5;
    case5['item_type'] = 2;
    case5['item_name'] = data['calling_type'] + '-' + carrierName + "発信分 通話秒数（国際）";
    case5['call_sec'] = 0;
    case5['amount'] = 0 * rate['rate_sec'];
    case5['rate'] = rate['rate_sec'];
    case5['remarks'] = newOicName + "着信" + billingMonth + "月分";


    case6['call_count'] = 0;
    case6['line_no'] = lineCounter * 6 + 6;
    case6['item_type'] = 3;
    case6['item_name'] = data['calling_type'] + '-' + carrierName + "発信分 ﾄﾗﾝｸﾎﾟｰﾄ接続料（国際）";
    case6['call_sec'] = 0;
    case6['amount'] = 0;
    case6['rate'] = rate['rate_trunk_port'];
    case6['remarks'] = newOicName + "着信" + billingMonth + "月分";


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

async function getSougoRatesIPData(data, carrier_ioi, company_code, term_ioi) {
  let res = {};

  try{
    let tmpData = data.filter((obj) => {
      if (obj['company_code'] == company_code && obj['host_name'].toLowerCase().trim() == carrier_ioi.toLowerCase() )
        return true;
    });

    console.log("tmpData"+JSON.stringify(tmpData))
  
    if(tmpData.length==0){
      console.log("Rate is not register")
      throw new Error("Rate is not register")
    }else if(tmpData.length==1) {
      res['rate_setup'] = tmpData[0]['rate_setup'];
      res['rate_sec'] = tmpData[0]['rate_second'];
      res['rate_trunk_port'] = tmpData[0]['rate_trunk_port'];
      return res;
    }else{
      for(let i=0; i< tmpData.length; i++){
        if(tmpData[i]['typeof_call'] == term_ioi ){
         
          res['rate_setup'] = tmpData[i]['rate_setup'];
          res['rate_sec'] = tmpData[i]['rate_second'];
          res['rate_trunk_port'] = tmpData[i]['rate_trunk_port'];
          return res;
        }
      }
    }
  
  return res;
  }catch(e){
    console.log("Error in getting ip data rates..."+ e.message);
  }
  
}


async function getSougoRates(data, carrier_code, company_code, term_carrier_code) {
  let res = {};
 let tmpObj = data.filter((obj) => {
    if (obj['carrier_code'] == carrier_code)
      return true;
  });

  let filterLength = tmpObj.length;

  if (filterLength == 1) {
    res['rate_setup'] = tmpObj[0]['rate_setup'];
    res['rate_sec'] = tmpObj[0]['rate_second'];
    res['rate_trunk_port'] = tmpObj[0]['rate_trunk_port'];
    return res;
  }

  try {

    // if(company_code!='' && term_carrier_code !=''){

    // }else if(){

    // }


    

    for (let i = 0; i < tmpObj.length; i++) {
      if (tmpObj[i]['term_carrier_code'] == term_carrier_code && tmpObj[i]['company_code'] == company_code) {
        res['rate_setup'] = tmpObj[i]['rate_setup'];
        res['rate_sec'] = tmpObj[i]['rate_second'];
        res['rate_trunk_port'] = tmpObj[i]['rate_trunk_port'];
        console.log("res in side company code")
        return res;
      }
    }

    // for (let i = 0; i < tmpObj.length; i++) {
    //   if (tmpObj[i]['company_code'] == company_code) {
    //     res['rate_setup'] = tmpObj[i]['rate_setup'];
    //     res['rate_sec'] = tmpObj[i]['rate_second'];
    //     res['rate_trunk_port'] = tmpObj[i]['rate_trunk_port'];
    //     console.log("res in side company code")
    //     return res;
    //   }
    // }

    /************* when  term carrier id is blank but company code is present */

    for (let i = 0; i < tmpObj.length; i++) {
      if (tmpObj[i]['company_code'] == company_code && (tmpObj[i]['term_carrier_code'] == '' || tmpObj[i]['term_carrier_code'] == null)) {
        res['rate_setup'] = tmpObj[i]['rate_setup'];
        res['rate_sec'] = tmpObj[i]['rate_second'];
        res['rate_trunk_port'] = tmpObj[i]['rate_trunk_port'];
        console.log("res in side not company code")
        return res;
      }
    }


    for (let i = 0; i < tmpObj.length; i++) {
      if (tmpObj[i]['term_carrier_code'] == term_carrier_code && (tmpObj[i]['company_code'] == '' || tmpObj[i]['company_code'] == null)) {
        res['rate_setup'] = tmpObj[i]['rate_setup'];
        res['rate_sec'] = tmpObj[i]['rate_second'];
        res['rate_trunk_port'] = tmpObj[i]['rate_trunk_port'];
        console.log("res in side not company code")
        return res;
      }
    }


    for (let i = 0; i < tmpObj.length; i++) {
      if (tmpObj[i]['carrier_code'] == carrier_code && (tmpObj[i]['company_code'] == '' || tmpObj[i]['company_code'] == null)) {
        res['rate_setup'] = tmpObj[i]['rate_setup'];
        res['rate_sec'] = tmpObj[i]['rate_second'];
        res['rate_trunk_port'] = tmpObj[i]['rate_trunk_port'];
        console.log("res in side not company code")
        return res;
      }
    }

    for (let i = 0; i < tmpObj.length; i++) {
      
      if (tmpObj[i]['term_carrier_code'] == term_carrier_code ) {
        res['rate_setup'] = tmpObj[i]['rate_setup'];
        res['rate_sec'] = tmpObj[i]['rate_second'];
        res['rate_trunk_port'] = tmpObj[i]['rate_trunk_port'];
        console.log("res in side term carrier code")
        return res;
      }
    }


    for (let i = 0; i < tmpObj.length; i++) {
      if (tmpObj[i]['company_code'] == company_code) {
        res['rate_setup'] = tmpObj[i]['rate_setup'];
        res['rate_sec'] = tmpObj[i]['rate_second'];
        res['rate_trunk_port'] = tmpObj[i]['rate_trunk_port'];
        console.log("res in side company code")
        return res;
      }
    }

  

  } catch (err) {
    console.log("error in get rates");
  }

  return res;
}


async function getCustomerInfo(company_code) {
  try {
    const query = `select *, (select payment_due_date from company where company_code='${company_code}' limit 1)as payment_due_date
    ,(select company_name from company where company_code='${company_code}' limit 1)as company_name  from bill_info 
    where company_code='${company_code}'`;

    const ratesRes = await db.queryIBS(query, [], true);

    if (ratesRes.rows) {
      return (ratesRes.rows);
    }

  } catch (error) {
    return error;
  }
}

async function getInvoiceData(company_code, year, month, newData) {
  try {
    let query ="" ;
    if(newData){

      query = `select * from (select bill_no,line_no, item_name, rate, call_sec, amount , remarks from bill_detail_new where amount>1 )as lj join 
      (select bill_no, company_code, date_bill  from bill_history_new
        where company_code='${company_code}'   and to_char(date_bill, 'MM-YYYY') =  '${month}-${year}') as rj
         on (lj.bill_no=rj.bill_no) order by line_no` ;
  
    }else{
      query = `select * from (select bill_no,line_no, item_name, rate, call_sec, amount , remarks from bill_detail where amount>1 )as lj join 
      (select bill_no, company_code, date_bill  from bill_history
        where company_code='${company_code}'   and to_char(date_bill, 'MM-YYYY') =  '${month}-${year}') as rj
         on (lj.bill_no=rj.bill_no) order by line_no` ;
  
    }
    

    const ratesRes = await db.queryIBS(query, []);

    if (ratesRes.rows) {
      return (ratesRes.rows);
    }

  } catch (error) {
    return error;
  }
}

async function getPaymentPlanDueDate(date, mode){

  let addMonth = 0 , billingDueYear , billingDueMonth, paymentDueYearMonth;
  
  const myDate = date;

  if(mode === 'yearly'){
    
    
    paymentDueYearMonth = new Date(myDate.setMonth(3));
    billingDueYear = paymentDueYearMonth.getFullYear() + 1;
    billingDueMonth = paymentDueYearMonth.getMonth() + 1;

  }else if(mode ==='half_yearly'){
  
    paymentDueYearMonth = new Date(myDate.setMonth(9));
    billingDueYear = paymentDueYearMonth.getFullYear();
    billingDueMonth = paymentDueYearMonth.getMonth() + 1;

  }else {
    paymentDueYearMonth = new Date(myDate.setMonth(myDate.getMonth()));
    billingDueYear = paymentDueYearMonth.getFullYear();
    billingDueMonth = paymentDueYearMonth.getMonth() + 1;
  }

  //if(mode === 'year')





      const lastDayOfMonth = new Date(billingDueYear, billingDueMonth, 0);

      const billingDueDay = lastDayOfMonth.getDate();


      // check first weekend 

      const getHolidays = await common.getHolidayByYear(billingDueYear);

      let {actualDayValue, actualbillingDueMonth} = await getValidDate(billingDueYear, billingDueMonth, billingDueDay, getHolidays);


      console.log("billingDueYear"+billingDueYear)

      console.log("billingDueMonth----"+billingDueMonth)

      console.log("billingDueDay"+billingDueDay)

      console.log("actualDayValue----"+actualDayValue)


      actualDayValue = actualDayValue.toString().padStart(2, '0') ;
      actualbillingDueMonth = actualbillingDueMonth.toString().padStart(2, '0') ;

      const validPaymentPlanDate = `${billingDueYear}-${actualbillingDueMonth}-${actualDayValue}`;

      console.log("validPayemt date is " + validPaymentPlanDate);

      return validPaymentPlanDate;

}

async function getValidDate(billingDueYear, billingDueMonth, billingDueDay, getHolidays) {

  let tmpbillingDueMonth = billingDueMonth ;
  let tmpactualBillingMonth = billingDueMonth - 1;

  let actualBillingMonth = billingDueMonth - 1;

  var actualDayValue = billingDueDay;

  if (billingDueDay < 1) {
    return billingDueDay;
  }

  let count = 0

  async function callRec(billingDueYear, billingDueMonth, actualBillingMonth, actualDayValue, getHolidays) {
    let counter = 0 ;

    console.log("actualDayValue is"+actualDayValue)

    const checkIfWeekend = await common.checkIfWeekend(billingDueYear, actualBillingMonth, actualDayValue);
    const checkIfHoilday = await common.checkIfHoilday(billingDueYear, billingDueMonth, actualDayValue, getHolidays);
    if (checkIfWeekend || checkIfHoilday) {
      actualDayValue = count + 1;
      counter = 1
      count ++ ;
      if(counter == 1 && tmpbillingDueMonth == billingDueMonth && tmpactualBillingMonth == actualBillingMonth ){
        billingDueMonth = billingDueMonth+1
        actualBillingMonth = actualBillingMonth + 1
      }

      return await callRec(billingDueYear, billingDueMonth, actualBillingMonth, actualDayValue, getHolidays)
    } else {
      const actualbillingDueMonth = billingDueMonth
      return {actualDayValue, actualbillingDueMonth  };
    }
  }

  return await callRec(billingDueYear, billingDueMonth, actualBillingMonth, actualDayValue, getHolidays);

}



async function createInvoice(company_code, billingYear, billingMonth, invoice, path, subTotal, currentMonth, address, totalCallDuration) {

  let tax = parseInt(subTotal * .1);
  let totalCallAmount = parseInt(subTotal) + (tax);
  let doc = new PDFDocument({ margin: 50 });
  let MAXY = doc.page.height - 50;
  let fontpath = (__dirname + '\\..\\..\\controllers\\font\\ipaexg.ttf');
  let imagePath = (__dirname+'\\IPSP_seal.jpg')
  doc.font(fontpath);
  //{ width: 100, align: "right" }
  doc.image(imagePath, 465, 60, {
    fit: [120, 160],
    align: 'right',
    //width: '300'
  });

  let paymentDueDate = "";
  let tmpPaymentDate = "", tmpCurrentMonth =  new Date(currentMonth.valueOf()) ;
  if (address && address[0]) {
    tmpPaymentDate = address[0]['payment_due_date'];
  }

  console.log("before current month"+ currentMonth)
   paymentDueDate = await getPaymentPlanDueDate(tmpCurrentMonth, tmpPaymentDate);

  console.log("new payment date" + paymentDueDate) ;
  console.log("after current month"+ currentMonth)
 

  // const currentYear = new Date(currentMonth).getFullYear();
  // let currentMonthValue = new Date(currentMonth).getMonth() + 1;
  // if (parseInt(currentMonthValue, 10) < 10) {
  //   currentMonthValue = '0' + currentMonthValue;
  // }

  // let lastMonthDay  = new Date(currentYear, currentMonthValue, 0).getDate();
  
  //   if (tmpPaymentDate == 'yearly') {
  //     if (parseInt(billingMonth) >= 4){
  //       console.log("IF")
  //       paymentDueDate = `${billingYear +1}/04/30`;
  //     }        
  //     else{
  //       console.log("ELSE")
  //       paymentDueDate = `${currentYear }/04/30`;
  //     }
        
  //   } else if (tmpPaymentDate == 'half_yearly') {
  //     if (parseInt(billingMonth) > 10 && parseInt(billingMonth) >=3 )
  //       paymentDueDate = `${billingYear +1}/10/31`;
  //     else
  //       paymentDueDate = `${currentYear}/10/31`;
  //   } else {
  //     //paymentDueDate = `${currentYear}/${currentMonthValue}/${lastMonthDay}`;
  //     // monthly due date!
  //     paymentDueDate = `${currentYear }/07/01`;
  //   }

  await generateHeader(address, doc, totalCallAmount);

  let y = generateCustomerInformation(company_code, billingYear, billingMonth, doc, invoice, 210, currentMonth, totalCallAmount, paymentDueDate);

  //drawLine(doc, 198);


  console.log("y=--" + y);
  addTableHeaderFC(doc, 50, y + 45, totalCallAmount, totalCallDuration, billingYear, billingMonth);
  y = customTableFC(doc, y + 55, invoice, MAXY);

  y = tableSummary(doc, 350, y, subTotal);
  y = genrateAccountInfo(doc, y);
  generateFooter(doc, y + 10);
  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function tableSummary(doc, x, y, subTotal) {

  let tax = parseInt(subTotal * .1);
  let totalCallAmount = parseInt(subTotal) + (tax);

  doc
    .fontSize(8)

    .text(`小合計(10%対象)(Sub-Total)`, x+30, y + 20, { width: 150, align: "left" })

    .text(`消費税 (Tax)`, x+30 , y + 35, { width: 150, align: "left" })
    // drawLine(doc, y + 48, x + 50, 500)
    .text(`合計 (Total Amount)`, x+30 , y + 50, { width: 150, align: "left" })
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

function genrateAccountInfo(doc, y) {
  doc
    .fontSize(8)
    .text("<<   お振込先   >>", 150, y)
    .moveDown()
    .text("三菱ＵＦＪ銀行　新富町支店", 150)
    .moveDown()
    .text("普通預金　0019761")
    .moveDown()
    .text("株式会社アイ・ピー・エス・プロ")
    .moveDown()
    .moveDown()
    .moveDown()

}

async function generateHeader(customerDetails, doc, totalCallAmount) {

  let postNumber = customerDetails[0]['zip_code'];

  let customerName = customerDetails[0]['company_name'];
  let address1 = customerDetails[0]['address1'];
  let address2 = customerDetails[0]['address2'];
  let person_incharge = customerDetails[0]['person_incharge'];
  let person_incharge_1 = customerDetails[0]['person_incharge_1'];

  if(person_incharge_1=='' || person_incharge_1=='null' || person_incharge_1==null){
    person_incharge_1='';
  }

  if (postNumber) {
    postNumber = [postNumber.slice(0, 3), '-', postNumber.slice(3)].join('');
  }

  doc
    // .image("logo.png", 50, 45, { width: 50 })
    //.fillColor("#444444")
    .fontSize(10)
    .text(`〒${postNumber}`, 65, 12)
    .text(`${address1}`, 65, 25)
    .text(`${address2}`, 65, 38)
    .text(`${customerName}`, 65, 51)
    .text(`${person_incharge}`, 65, 65)
    .text(`${person_incharge_1}`, 65, 78)

    .text("株式会社アイ・ピー・エス・プロ", 10, 110, { align: "right" })
    .text("〒104-0061", 10, 123, { align: "right" })
    .text("東京都中央区銀座4-12-15 歌舞伎座タワー8F", 10, 136, { align: "right" })
    .text("TEL : 03-3549-7626", 10, 149, { align: "right" })
    .text("FAX : 03-3545-7331", 10, 162, { align: "right" })

    .text("株式会社アイ・ピー・エス・プロ", 10, 175, { align: "right" })
    .text("登録番号：T5010001227842", 10, 188, { align: "right" })

    .text("請 求 書", 0, 188, { align: "center" })


    // .text("下記のとおりご請求申し上げます。", 50, 170)
    // .text(`ご請求金額合計 (Total Amount):  ${utility.numberWithCommas(totalCallAmount)}`, 50, 170, { align: "right" })

    .moveDown();

}

async function generateFooter(doc, y) {
  // console.log("in footer")
  doc
    .fontSize(8)
    .text("≪　ご連絡事項　≫", 50)
    .moveDown()
    .text("毎度格別のお引き立てをいただきまして、誠にありがとうございます。")
    .moveDown()
    .text("ご請求書を送付させていただきますので、ご査収の上お支払期日までに上記の振込先にお振込いただきますようよろしくお願い申し上げます。")
    .moveDown()
    .text("なお、誠に勝手ながら銀行振込に係る手数料につきましては、貴社にてご負担いただきますようお願い申し上げます。")
    .moveDown()

}


function row(doc, heigth) {
  doc.lineJoin('miter')
    .rect(33, heigth, 560, 40)
    .stroke()
  return doc
}

function customTableFC(doc, y, data, MAXY) {
  console.log("in table FC");
  let height = y;
  let counter = 1;
  for (let i = 0; i < data.length; i++) {
    height = height + 20;
    textInRowFirst(doc, i + 1, 50, height, "center", 15);
    textInRowFirst(doc, data[i].item_name, 65, height, null, 265);
    textInRowFirst(doc, data[i].rate, 330, height, "right", 50);
    textInRowFirst(doc, utility.numberWithCommas(parseInt(data[i].call_sec)), 380, height, "right", 60);
    textInRowFirst(doc, '¥' + utility.numberWithCommas(parseInt(data[i].amount)), 440, height, "right", 50);
    textInRowFirst(doc, (data[i].remarks), 490, height, "right", 70);
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

function addTableHeader(doc, x, y, totalAmount, totalCallDuration, billingYear, billingMonth) {
  console.log("y---" + y);

  doc
    .fontSize(10)
    .text(`サービス品目`, 50, y, { width: 100, align: "center" })
    .text(`手数料種類`, 150, y, { width: 100, align: "center" })
    .text(`着信時間（分数）`, 250, y, { width: 100, align: "center" })
    .text(`ご請求期間`, 350, y, { width: 100, align: "center" })
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
    .text(`音声着信サービス`, 50, y + 25, { width: 100, align: "center" })
    .text(`1ヶ月間の累積着信分数`, 150, y + 25, { width: 100, align: "center" })
    .text(`${totalCallDuration}`, 250, y + 25, { width: 100, align: "center" })
    .text(`${billingYear}/${billingMonth}/1 ～ ${billingYear}/${billingMonth}/${daysInMonth(billingMonth, billingYear)}`, 350, y + 25, { width: 100, align: "center" })
    .text(`${utility.numberWithCommas(totalAmount)}`, 450, y + 25, { width: 110, align: "center" })

    .text(`Voice Receiver Service`, 50, y + 37, { width: 100, align: "center" })
    .text(`1 Month(s) Accumulative`, 150, y + 37, { width: 100, align: "center" })


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



function generateCustomerInformation(company_code, billingYear, billingMonth, doc, invoice, y, currentMonth, totalAmount, paymentDueDate) {


  console.log("gci current month"+ currentMonth)

  const currentYear = new Date(currentMonth).getFullYear();
  let currentMonthValue = new Date(currentMonth).getMonth() + 1;
  if (parseInt(currentMonthValue, 10) < 10) {
    currentMonthValue = '0' + currentMonthValue;
  }


  doc
    .text(`お客様コード番号`, 50, y, { width: 100, align: "center" })
    .text(`請求書番号`, 150, y, { width: 100, align: "center" })
    .text(`発行年月日`, 250, y, { width: 100, align: "center" })
    .text(`ご請求期間`, 350, y, { width: 100, align: "center" })
    .text(`お支払期限`, 450, y, { width: 100, align: "center" })


    .text(`Customer Code`, 50, y + 10, { width: 100, align: "center" })
    .text(`Invoice Number`, 150, y + 10, { width: 100, align: "center" })
    .text(`Date of Issue`, 250, y + 10, { width: 100, align: "center" })
    .text(`Billing Period`, 350, y + 10, { width: 100, align: "center" })
    .text(`PAYMENT DUE DATE`, 450, y + 10, { width: 110, align: "center" })

  doc.rect(50, y - 5, 100, 30).stroke()
  doc.rect(150, y - 5, 100, 30).stroke()
  doc.rect(250, y - 5, 100, 30).stroke()
  doc.rect(350, y - 5, 100, 30).stroke()
  doc.rect(450, y - 5, 110, 30).stroke()

    //drawLine(doc, y + 22)
    .fontSize(8)
    .text(`${company_code}`, 50, y + 30, { width: 100, align: "center" })
    .text(`${company_code}-${billingYear}${billingMonth}-1`, 150, y + 30, { width: 100, align: "center" })
    .text(`${currentYear}/${currentMonthValue}/01`, 250, y + 30, { width: 100, align: "center" })
    .text(`${billingYear}/${billingMonth}/01 ～ ${billingYear}/${billingMonth}/${daysInMonth(billingMonth, billingYear)}`, 350, y + 30, { width: 100, align: "center" })
    .text(paymentDueDate, 450, y + 30, { width: 110, align: "center" })

  doc.rect(50, y + 25, 100, 25).stroke()
  doc.rect(150, y + 25, 100, 25).stroke()
  doc.rect(250, y + 25, 100, 25).stroke()
  doc.rect(350, y + 25, 100, 25).stroke()
  doc.rect(450, y + 25, 110, 25).stroke()


    //row(doc, 200)    
    .moveDown();
  return y + 35;
}

function drawLine(doc, startX, Y = 50, Z = 550) {
  doc
    .moveTo(Y, startX)                            // set the current point
    .lineTo(Z, startX)                            // draw a line
    .stroke();
  return doc;                                // stroke the path
}




function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}


