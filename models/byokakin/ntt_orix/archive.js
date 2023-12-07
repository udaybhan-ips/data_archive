var db = require('./../../../config/database');
const { BATCH_SIZE } = require('../../../config/config');
const iconv = require('iconv-lite');
const utility = require("../../../public/javascripts/utility")


let ColumnSetNTTORIXKoteihi = ['did', 'carrier', 'service_name', 'amount', 'taxclassification', 'dailydisplay', 'date_added', 'carrier_name'];

let ColumnSetNTTORIXKoteihiCDR = ['companyname', 'comp_acco__c', 'kaisenbango', 
'riyougaisya', 'seikyuuuchiwake', 'kingaku', 'zeikubun', 'hiwarihyouji', 'datebill', 'linkedcdrid','carrier'];
let tableNameNTTORIXKoteihiCDR = { table: 'ntt_koteihi_cdr' };
let ColumnSetNTTORIXKoteihiCDRBILL = ['cdrid', 'bill_code', 'comp_acco__c', 'bill_count', 'companyname', 
'kaisenbango', 'riyougaisya', 'seikyuuuchiwake', 'kingaku', 'zeikubun', 'datebill','carrier','ips_amount'];
let tableNameNTTORIXKoteihiCDRBILL = { table: 'ntt_koteihi_cdr_bill' };


let ColumnSetNTTORIXInbound = ['customername', 'did', 'calldate', 'calltime', 'callduration', 'callcharge', 'callcount104',
  'freedialnum', 'source', 'division', 'terminaltype', 'carriertype'];

let ColumnSetNTTORIXOutbound = ['customername', 'parentdid', 'calltype', 'calldate', 'calltime', 'cld', 'destination', 'callduration',
  'callcharge', 'callcount104', 'did', 'carriertype'];




var fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
var csv = require('fast-csv');
const { exit } = require('process');
//import { parse } from 'csv-parse';


module.exports = {

  getTargetDate: async function (date_id) {
    try {
      const query = `SELECT date_id , date_set::date + interval '1' day as next_run_time  ,  (date_set)::date + interval '0 HOURS' as target_date , (date_set)::date - interval '9 HOURS'  as target_date_with_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
      const targetDateRes = await db.query(query, []);
      // console.log(targetDateRes);
      if (targetDateRes.rows) {
        return { 'id': (targetDateRes.rows[0].date_id), 'next_run_time': (targetDateRes.rows[0].next_run_time), 'targetDate': (targetDateRes.rows[0].target_date), 'targetDateWithTimezone': (targetDateRes.rows[0].target_date_with_timezone) };
      }
      return { err: 'not found' };
    } catch (error) {
      return error;
    }
  },

  getNTTORIXCustomer: async function () {
    try {
      const query = `select id, customer_cd, customer_name, address, staff_name from  m_customer 
      where is_deleted=false and service_type ->> 'ntt_orix_customer' ='true' order by customer_cd desc`;
      const NTTORIXCustomerListRes = await db.query(query, [], true);
      // console.log(targetDateRes);
      if (NTTORIXCustomerListRes.rows) {
        return NTTORIXCustomerListRes.rows
      }

      throw new Error('Error in fetching customer.' + NTTORIXCustomerListRes)

    } catch (error) {
      console.log("error...." + error.message)
      throw new Error('Error in fetching customer.' + error.message)
    }
  },

  getCustomerList: async function () {
    try {
      const query = `select customer_cd, customer_name, address, staff_name from  m_customer 
      where is_deleted=false and service_type ->> 'ntt_orix_customer' ='true' order by customer_cd desc`
      const getCustomerList = await db.query(query, [], true);
      return getCustomerList.rows;
    } catch (e) {
      console.log("err in get ntt orix company list=" + e.message);
      return e;
    }
  },

  getNTTORIXFreeDialNumList: async function () {
    try {
      const query = `select data_idno, cust_code__c, carr_comp__c, free_numb__c from  ntt_kddi_freedial_c where carr_comp__c='NTT' order by  free_numb__c`
      const getNTTORIXFreeDialNumListRes = await db.queryByokakin(query, []);
      return getNTTORIXFreeDialNumListRes.rows;
    } catch (e) {
      console.log("err in get ntt free dial number list=" + e.message);
      return e;
    }
  },

  getKDDIFreeAccountNumList: async function () {
    try {
      const query = `select carriername, comp_code__c, accountid, usedflag from free_call_account where carriername='KDDI' and usedflag = '1' `
      const getKDDIFreeAccountNumListRes = await db.queryByokakin(query, []);
      return getKDDIFreeAccountNumListRes.rows;
    } catch (e) {
      console.log("err in get kddi free account number list=" + e.message);
      return e;
    }
  },
  getNTTORIXKotehiData: async function ({ year, month, comCode }) {
    try {
      const query = `select row_number() over() as id, * from ntt_koteihi_cdr 
      where  to_char(datebill::date, 'MM-YYYY')='${month}-${year}' and carrier='NTT_ORIX' `;
      const getNTTORIXKotehiDataRes = await db.queryByokakin(query, []);
      return getNTTORIXKotehiDataRes.rows;
    } catch (e) {
      console.log("err in get ntt kotehi data=" + e.message);
      throw new Error(e);
    }
  },

  getNTTORIXKotehiLastMonthData: async function ({ year, month, comCode }) {
    try {
      let where = "";

      let lastMonthDate = utility.getPreviousYearMonth(`${year}-${month}`);

      const lastYear = lastMonthDate.year;
      const lastMonth = lastMonthDate.month;
      const query = ` select row_number() over() as id, * from ntt_koteihi_cdr 
      where  to_char(datebill::date, 'MM-YYYY')='${lastMonth}-${lastYear}' and carrier='NTT_ORIX'`;
      const getLastMonthNTTORIXKotehiDataRes = await db.queryByokakin(query, []);
      return getLastMonthNTTORIXKotehiDataRes.rows;
    } catch (e) {
      console.log("err in last month NTTORIX kotehi data=" + e.message);
      return e;
    }
  },


  getNTTORIXKotehiLastMonthProcessedData: async function ({ year, month, comp_code }) {
    try {

      let where = "";
      let lastMonthDate = utility.getPreviousYearMonth(`${year}-${month}`);
      const lastYear = lastMonthDate.year;
      const lastMonth = lastMonthDate.month;
      console.log("year, month, com code.." + year, month, comp_code);

      if (comp_code && year && month) {
        where = ` where to_char(datebill::date, 'MM-YYYY')='${lastMonth}-${lastYear}' and 
        substring(split_part(bill_code, '-',2),4) as comp_code ='${comCode}' `;
      } else if (!comp_code && year && month) {
        where = `where to_char(datebill::date, 'MM-YYYY')='${lastMonth}-${lastYear}' `;
      } else {
        throw new Error('please select billing year and month');
      }

      const query = ` select row_number() over() as id, *, substring(split_part(bill_code, '-',2),4) as comp_code from 
      ntt_koteihi_cdr_bill ${where}` ;

      console.log("query...." + query)

      const getNTTORIXKotehiLastMonthDataRes = await db.queryByokakin(query, []);
      return getNTTORIXKotehiLastMonthDataRes.rows;
    } catch (e) {
      console.log("err in get NTTORIX last month list=" + e.message);
      return e;
    }
  },

  getNTTORIXKotehiProcessedData: async function ({ year, month, carrier }) {
    try {
      console.log("in orix year , month .." + year, month);
      
      let lastMonthDate = utility.getPreviousYearMonth(`${year}-${month}`);
      const lastYear = lastMonthDate.year;
      const lastMonth = lastMonthDate.month;

      const query = ` select lj.*, rj.date_added, rj.added_by from  ( select * from (select  row_number() over() as id, substring(split_part(bill_code, '-',2),4) as comp_code,  
      sum (kingaku) as amount from ntt_koteihi_cdr_bill where to_char(datebill::date, 'MM-YYYY')='${month}-${year}' 
      group by substring(split_part(bill_code, '-',2),4)) as lj 
      left join 
      (select  row_number() over() as id, substring(split_part(bill_code, '-',2),4) as prev_comp_code,  
      sum (kingaku) as prev_amount from ntt_koteihi_cdr_bill where to_char(datebill::date, 'MM-YYYY')='${lastMonth}-${lastYear}' 
      group by substring(split_part(bill_code, '-',2),4)) as last_month 
      on (lj.comp_code= last_month.prev_comp_code)) lj

      left join (
        select date_added, added_by, substring(comp_acco__c,5) as comp_code from 
        ntt_koteihi_bill_summary where to_char(bill_start__c::date, 'MM-YYYY') ='${month}-${year}' 
        and deleted=false 
       ) as rj on (lj.comp_code=rj.comp_code) `;

      const getNTTORIXKotehiProcessedDataRes = await db.queryByokakin(query, []);
      return getNTTORIXKotehiProcessedDataRes.rows;
    } catch (e) {
      console.log("err in get ntt kotehi billing summary =" + e.message);
      return e;
    }
  },

  deleteKotehiProcessedData: async function ({ billing_month, customer_cd, deleted_by }) {
    try {
      console.log("year, month .." + billing_month, customer_cd);

      const query = `delete from ntt_koteihi_cdr_bill where to_char(datebill,'YYYY-MM') ='${billing_month}' and comp_acco__c='${customer_cd}' `;
      const deleteKotehiProcessedDataRes = await db.queryByokakin(query, []);

      const querySumarry = `update ntt_koteihi_bill_summary set deleted = true, deleted_by='${deleted_by}' 
      where to_char(bill_start__c,'YYYY-MM') ='${billing_month}' and comp_acco__c='${customer_cd}' and carrier= 'NTT_ORIX'`;
      const deleteKotehiProcessedSummaryDataRes = await db.queryByokakin(querySumarry, []);

      console.log(JSON.stringify(deleteKotehiProcessedDataRes))

      return deleteKotehiProcessedDataRes;
    } catch (e) {
      console.log("err in get kddi last month list=" + e.message);
      return e;
    }
  },


  addKotehiData: async function (reqData) {

    //console.log("data..."+ JSON.stringify(reqData));
    try {
      const [{ data: [{ row }, { selectedData }] }, { currentUser }] = reqData;

      // console.log("data.."+JSON.stringify(row));
      // console.log("selectedData.."+JSON.stringify(selectedData));
      // console.log("currentUser.."+JSON.stringify(currentUser));

      let comCode = '', comCode4Dig = '';

     

      if (row.length > 0 && selectedData.comp_code!=undefined && selectedData.comp_code!=null)  {
        comCode = selectedData.comp_code;
        comCode4Dig = comCode.slice(comCode.length - 4);
      } else {
        throw new Error('request data not available');
      }

      const query = ` select *, substring(split_part(bill_code, '-',2),4) as comp_code from ntt_koteihi_cdr_bill where   
      to_char(datebill::date, 'MM-YYYY')='${selectedData.month}-${selectedData.year}' and  substring(split_part(bill_code, '-',2),4) = '${comCode4Dig}' `;

      const getNTTORIXKotehiLastMonthDataRes = await db.queryByokakin(query, []);
      const bill_code = `NTTORIX-FIX${comCode.slice(comCode.length - 4)}-${selectedData.year}${selectedData.month}-1`;
      let amount = 0,  ipsAmount= 0;

      if (getNTTORIXKotehiLastMonthDataRes.rows && getNTTORIXKotehiLastMonthDataRes.rows.length > 0) {
        return 'alredy processed';
      } else {

        let tmpData = [];

        

        for (let i = 0; i < row.length; i++) {
          let tmpObj = {}, ips_amount =0 ;
          if(row[i]['ips_amount']!==undefined && row[i]['ips_amount']!==null && row[i]['ips_amount']!==''){
            ipsAmount += parseFloat(row[i]['ips_amount']);
            ips_amount = row[i]['ips_amount'];
          }
          else{
            ipsAmount = 0;
          }
          amount += parseFloat(row[i]['kingaku']);
          tmpObj['cdrid'] = row[i]['cdrid'];
          tmpObj['companyname'] = row[i]['companyname'];
          tmpObj['comp_acco__c'] = row[i]['comp_acco__c'];
          tmpObj['bill_code'] = bill_code;
          tmpObj['datebill'] = `${selectedData.year}-${selectedData.month}-01`;
          //  tmpObj['sort_order'] = data[i]['sort_order'];
          tmpObj['bill_count'] = row[i]['cdrcnt'];
          tmpObj['kaisenbango'] = row[i]['kaisenbango'];
          tmpObj['riyougaisya'] = row[i]['riyougaisya'];
          tmpObj['seikyuuuchiwake'] = row[i]['seikyuuuchiwake'];
          tmpObj['zeikubun'] = row[i]['zeikubun'];
          tmpObj['kingaku'] = row[i]['kingaku'];
          tmpObj['carrier'] = 'NTT_ORIX';
          tmpObj['ips_amount'] = ips_amount;
          tmpData.push(tmpObj);
        }
        const insertKotehiDataRes = await insertByBatches(tmpData, 'ntt_koteihi_cdr_bill');

        console.log("insertKotehiDataRes.." + JSON.stringify(insertKotehiDataRes));


        const insertKotehiSummaryData = `insert into ntt_koteihi_bill_summary (bill_numb__c, bill_start__c, bill_sum__c, 
          comp_acco__c, date_added, added_by, carrier, ips_amount) values ('${bill_code}','${selectedData.year}-${selectedData.month}-01','${amount}',
          '${comCode}',now(),'${currentUser}', 'NTT_ORIX', '${ipsAmount}') ` ;

          console.log("insertKotehiSummaryData is.."+ insertKotehiSummaryData);

        const insertKotehiSummaryDataRes = await db.queryByokakin(insertKotehiSummaryData,[]);


        if (insertKotehiDataRes.length > 0 && insertKotehiDataRes[0] == null) {
          return 'done';
        } else {
          throw new Error(insertKotehiDataRes);
        }
      }

    } catch (e) {
      console.log("err in get kddi free account number list=" + e.message);
      throw new Error(e.message);
    }
  },


  deleteTargetDateCDR: async function (billingYear, billingMonth, serviceType, callType) {

    try {
      let query = "";
      callType.forEach(ele => {
        if (ele == 'free_number')
          query = `delete FROM kddi_kotei_cdr_basic where to_char(datebill::date, 'MM-YYYY')= '${billingMonth}-${billingYear}' `;
        else
          query = `delete FROM kddi_kotei_cdr_contents where to_char(datebill::date, 'MM-YYYY')= '${billingMonth}-${billingYear}' `;
      });

      const deleteTargetDateRes = await db.queryByokakin(query, []);
      return deleteTargetDateRes;
    } catch (error) {
      return error;
    }
  },

  chargeKotehiData: async function (billingYear, billingMonth, freeDialNumList, customerList) {
    try {
      let query = `select * from byokakin_ntt_koteihi_${billingYear}${billingMonth} where carrier_name ='NTT_ORIX' `;
      const kotehiData = await db.queryByokakin(query, []);

      if (kotehiData && kotehiData.rows) {
        let tmpData = [];

        for (let i = 0; i < kotehiData.rows.length; i++) {
          let tmpObj = {};
          const comp_acco__c = await getCompanyCode(freeDialNumList, kotehiData.rows[i]['did']);
          const companyName = await getCompanyName(customerList, comp_acco__c);
          tmpObj['companyname'] = companyName;
          tmpObj['comp_acco__c'] = comp_acco__c;
          tmpObj['kaisenbango'] = kotehiData.rows[i]['did'];
          tmpObj['riyougaisya'] = kotehiData.rows[i]['carrier'];
          tmpObj['seikyuuuchiwake'] = kotehiData.rows[i]['service_name'];
          tmpObj['kingaku'] = kotehiData.rows[i]['amount'];
          tmpObj['zeikubun'] = kotehiData.rows[i]['taxclassification'];
          tmpObj['hiwarihyouji'] = kotehiData.rows[i]['dailydisplay'];
          tmpObj['datebill'] = `${billingYear}-${billingMonth}-01`;
          tmpObj['linkedcdrid'] = kotehiData.rows[i]['cdrid'];
          tmpObj['carrier'] = 'NTT_ORIX';

          tmpData.push(tmpObj);
        }
        insertByBatches(tmpData, 'ntt_koteihi_charge', billingYear, billingMonth);
      }


    } catch (error) {
      console.log("Error in ntt kotehi charging..." + error);
      throw new Error(error);
    }
  },

  getNTTORIXKotehiServiceData: async function () {
    try {
      const query = `select id, product_name from ntt_koteihi_product_details order by product_name asc`
      const getNTTORIXKotehiServiceDataRes = await db.queryByokakin(query, []);
      return getNTTORIXKotehiServiceDataRes.rows;
    } catch (e) {
      console.log("err in get NTTORIX kotehi a  service code company list=" + e.message);
      return e;
    }
  },

  insertNTTORIXKotehiDataByAPI: async function (data, fileName1, billingYear, billingMonth, carrierName) {

    try {

      let csvData = [];
      let DID = null;
      let carrier = null;

      console.log("data.."+JSON.stringify(data[0]))
      console.log("data.."+JSON.stringify(data[1]))

      for (let i = 0; i < data.length; i++) {

        let obj = {};

        // let tmpDID = data[i][0] != null ? data[i][0].trim() : null;
        // let tmpCarrier = data[i][1] != null ? data[i][1].trim() : null;

        // if (tmpDID != null && tmpDID != "") {
        //   if (tmpDID.indexOf("合計") == -1) {
        //     DID = tmpDID;
        //   }
        // } else if (tmpCarrier != null && tmpCarrier != "") {
        //   if (tmpCarrier.indexOf("合計") == -1) {
        //     carrier = tmpCarrier;
        //   }
        // } else {
          //if (data[i][3] != null && data[i][3].trim() != "") {

          console.log("data..."+data[i][0])

          if(data[i][0] !=='回線番号'){
            obj['did'] = data[i][0];
            obj['carrier'] = data[i][1];
            obj['service_name'] = data[i][2];
            obj['amount'] = data[i][3];
            obj['taxclassification'] = data[i][4];
            obj['date_added'] = `${billingYear}-${billingMonth}-01`;
            obj['dailydisplay'] = data[i][5];
            obj['carrier_name'] = 'NTT_ORIX';
            csvData.push(obj);
          }
          //}
        //}
      }

      console.log("csvData..."+csvData.length)

      await insertByBatches(csvData, 'ntt_koteihi', billingYear, billingMonth);
      //  return csvData;
    } catch (error) {
      console.log("Error" + error.message);
      return error;
    }
  },


  insertNTTORIXKotehiData: async function (filePath, fileName, billingYear, billingMonth, carrier) {

    try {

      let filesPath = path.join(__dirname, `../ntt_orix/data/${carrier}/${billingYear}${billingMonth}/Koteihi`);
      files = await readFilesName(filesPath);


      for (let i = 0; i < files.length; i++) {

        let csvData = [];
        let DID = null;
        let fileName = '';
        console.log("file name ..." + files[i]);

        if (path.extname(files[i]).toLowerCase() == '.csv') {
          fileName = path.join(__dirname, `../ntt_orix/data/${carrier}/${billingYear}${billingMonth}/Koteihi/${files[i]}`)

          await new Promise(resolve => setTimeout(resolve, 10000));
          let csvstream = fs.createReadStream(fileName)
            .pipe(iconv.decodeStream("Shift_JIS"))
            .pipe(csv.parse())
            .on('data', async function (row) {
              let obj = {};
              csvstream.pause();


              obj['did'] = row[0].trim();
              obj['carrier'] = row[1].trim();
              obj['service_name'] = row[2].trim();
              obj['amount'] = row[3].trim().replaceAll(",", "");
              obj['taxclassification'] = row[4];
              obj['date_added'] = `${billingYear}-${billingMonth}-01`;
              obj['dailydisplay'] = row[5].trim();
              obj['carrier_name'] = 'NTT_ORIX';
              csvData.push(obj);

              csvstream.resume();
            })
            .on('end', function () {
              csvData.shift();
              insertByBatches(csvData, 'ntt_koteihi', billingYear, billingMonth);
            })
            .on('error', function (error) {
              console.log("Error" + error.message);
            })

        }
      }
      //  return csvData;
    } catch (error) {
      console.log("Error" + error.message);
      return error;
    }
  },

  insertNTTORIXRAWData: async function (filesPathtest, billingYear, billingMonth, carrier) {

    let files = [];
    let filesPath = path.join(__dirname, `../ntt_orix/data/${carrier}/${billingYear}${billingMonth}/RAW_CDR`);
    files = await readFilesName(filesPath);
    let fileType = carrier == 'NTTORIX' ? '.csv' : '.txt';

    //console.log("actual path and name =" + (files));

    let resData = [];
    let excludedNumberList = ['0366317486', '0366317496', '0366317497', '0366317498', '67067608'];

    try {

      for (let i = 0; i < files.length; i++) {

        let csvDataInbound = [], csvDataOutbound = [], fileName = '';
        console.log("file name ..." + files[i]);



        if (path.extname(files[i]).toLowerCase() == fileType) {
          fileName = path.join(__dirname, `../ntt_orix/data/${carrier}/${billingYear}${billingMonth}/RAW_CDR/${files[i]}`)

          await new Promise(resolve => setTimeout(resolve, 10000));
          let csvstream = fs.createReadStream(fileName)
            .pipe(iconv.decodeStream("Shift_JIS"))
            .pipe(csv.parse())

            .on('data', function (row) {
              let obj = {};
              let obj1 = {};


              if (row[0].trim() != "組織計" && row[0].trim() != "合計" && row[1].trim() != "電話番号計") {

                let recordType = row[2].trim();
                let parentDID = row[1].trim();
                let cdrDate = null;
                let cdrChargeStr = row[8].replace("\\", "").replaceAll(",", "")
                parentDID = parentDID.replace("(", "").replace(")", "").replaceAll("-", "");

                let tempDate = row[3].trim();
                if (carrier == 'NTTORIX') {
                  tempDate = tempDate.replace("月", "/").replace("日", "/");
                }

                // Format CDR date
                cdrDate = `${billingYear}/${tempDate}`;


                if (recordType == 'フリーダイヤル') {
                  let terminaltype = row[15].trim();
                  if (parentDID == '0354913704' || parentDID == '0337002845' || parentDID == '0337008029' || parentDID == '0354912091'
                    || parentDID == '0354912097' || parentDID == '05038511863' ||  fileName.includes('割引対象外')) {
                    terminaltype = 'その他';
                  }

                  obj['customername'] = row[0].trim();
                  obj['did'] = parentDID;
                  obj['calldate'] = cdrDate;
                  obj['calltime'] = row[4].trim();
                  obj['callduration'] = row[7].trim();
                  obj['callcharge'] = cdrChargeStr;
                  obj['callcount104'] = row[9].trim();
                  obj['freedialnum'] = row[14].trim();
                  obj['terminaltype'] = terminaltype;
                  obj['source'] = row[18].trim();
                  obj['division'] = row[19].trim();
                  obj['carriertype'] = carrier;



                  csvDataInbound.push(obj);
                  csvstream.resume();
                } else {
                  let DID = ''
                  let tempRecord = row[13].trim().replaceAll("-", "");

                  if ((excludedNumberList.includes(tempRecord) && recordType == 'INS') ||
                    (recordType == 'VoIP' && excludedNumberList.includes(parentDID))) {
                    // csvstream.resume(); nothing to do
                  } else {
                    if (recordType == 'VoIP') {
                      DID = parentDID;
                    } else {
                      let prefix = parentDID.substring(parentDID.indexOf("(") + 1, parentDID.lastIndexOf(")"));
                      parentDID = parentDID.replace("(", "").replace(")", "").replaceAll("-", "");
                      if (recordType == "国際") {
                        DID = tempRecord;
                      } else {
                        DID = prefix + tempRecord;
                      }
                    }
                    obj1['customername'] = row[0];
                    obj1['parentdid'] = parentDID;
                    obj1['calltype'] = recordType;
                    obj1['calldate'] = cdrDate;
                    obj1['calltime'] = row[4];
                    obj1['cld'] = row[5];
                    obj1['destination'] = row[6];
                    obj1['callduration'] = row[7];
                    obj1['callcharge'] = cdrChargeStr;
                    obj1['callcount104'] = row[9];
                    obj1['did'] = DID;
                    obj1['carriertype'] = carrier;
                    csvDataOutbound.push(obj1);
                  }

                  csvstream.resume();
                }
              } else {
                //  console.log("Invalid data"+JSON.stringify(row))
              }
            })
            .on('end', function () {
              //csvDataInbound.shift();
              csvDataOutbound.shift();
              const res =  insertByBatches(csvDataInbound, 'RAWCDR_INB', billingYear, billingMonth);
              const resOut = insertByBatches(csvDataOutbound, 'RAWCDR_OUT', billingYear, billingMonth);
              resData.push(res);
            })
          console.log("res.." + resData.length);
        }
      }

      console.log("out of loop!!")

    } catch (error) {
      console.log("Error" + error.message);
      return error;
    }
  },


}

async function readFilesName(filePath) {
  try {
    return fsPromises.readdir(filePath);
  } catch (err) {
    console.error('Error occured while reading directory!', err);
  }
}


async function insertByBatches(records, type, billingYear, billingMonth) {
  const chunkArray = chunk(records, BATCH_SIZE);
  let res = [];
  let resArr = [];

  for (let i = 0; i < chunkArray.length; i++) {
    if (type === 'ntt_koteihi') {
      let tableNameNTTKoteihi = { table: `byokakin_ntt_koteihi_${billingYear}${billingMonth}` };
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetNTTORIXKoteihi, tableNameNTTKoteihi);
    } else if (type === 'ntt_koteihi_charge') {
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetNTTORIXKoteihiCDR, tableNameNTTORIXKoteihiCDR);

    } else if (type === 'RAWCDR_INB') {

      let tableNameNTTORIXRAWInb = { table: `byokakin_ntt_rawcdr_inbound_${billingYear}${billingMonth}` };
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetNTTORIXInbound, tableNameNTTORIXRAWInb);

    } else if (type === 'RAWCDR_OUT') {

      let tableNameNTTORIXRAWOut = { table: `byokakin_ntt_rawcdr_outbound_${billingYear}${billingMonth}` };
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetNTTORIXOutbound, tableNameNTTORIXRAWOut);

    }

    else if (type == 'ntt_koteihi_cdr_bill') {
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetNTTORIXKoteihiCDRBILL, tableNameNTTORIXKoteihiCDRBILL);
    }
    else {
      res = await db.queryBatchInsert(chunkArray[i], null, ColumnSet, tableName);
    }
  }
  resArr.push(res);
  console.log("done" + new Date());
  console.log(resArr);
  return resArr;

}




async function getCompanyCodeByAccount(companyCodeList, callToNum) {
  let res = '99999999';

  try {
    for (let i = 0; i < companyCodeList.length; i++) {
      if (callToNum.toLowerCase() == companyCodeList[i]['accountid'].trim().toLowerCase()) {
        res = companyCodeList[i]['comp_code__c'];
        break;
      }
    }

    if (res == '99999999') {
      console.log("callToNum.." + callToNum.toLowerCase(), "and length.." + callToNum.length);
    }

    return res;
  } catch (err) {
    console.log("Error in parsing company code..." + err.message)
  }

}

async function getCompanyCode(companyCodeList, did) {
  let res = '99999999';


  try {
    for (let i = 0; i < companyCodeList.length; i++) {
      if (did == companyCodeList[i]['free_numb__c'].trim()) {
        res = companyCodeList[i]['cust_code__c'];
        break;
      }
    }
    return res;
  } catch (err) {
    console.log("Error in parsing company code..." + err.message)
  }

}

async function getCompanyName(companyNameList, companyCode) {
  let res;
  try {
    for (let i = 0; i < companyNameList.length; i++) {
      if (companyCode == companyNameList[i]['customer_cd']) {
        res = companyNameList[i]['customer_name'];
        break;
      }
    }
    return res;
  } catch (err) {
    console.log("Error in parsing company name..." + err.message)
  }

}


function chunk(array, size) {

  console.log("chunk" + size);

  const chunked_arr = [];
  let copied = [...array]; // ES6 destructuring
  const numOfChild = Math.ceil(copied.length / size); // Round up to the nearest integer
  for (let i = 0; i < numOfChild; i++) {
    chunked_arr.push(copied.splice(0, size));
  }
  return chunked_arr;
}




