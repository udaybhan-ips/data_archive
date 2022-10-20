var db = require('./../../../config/database');
const { BATCH_SIZE } = require('../../../config/config');
const iconv = require('iconv-lite');
const utility = require("../../../public/javascripts/utility")


let ColumnSetNTTKoteihi = ['did', 'carrier','carrier_name', 'service_name', 'amount', 'taxclassification', 'dailydisplay', 'date_added'];
let ColumnSetNTTKoteihiCDR = ['companyname', 'comp_acco__c', 'kaisenbango', 'riyougaisya', 'seikyuuuchiwake', 'kingaku', 'zeikubun', 
'hiwarihyouji', 'datebill', 'linkedcdrid', 'carrier'];
let ColumnSetNTTKoteihiCDRBILL = ['cdrid', 'bill_code', 'comp_acco__c', 'bill_count', 'companyname', 'kaisenbango', 'riyougaisya',
 'seikyuuuchiwake', 'kingaku', 'zeikubun', 'datebill'];
let ColumnSetNTTInbound = ['customername', 'did', 'calldate', 'calltime', 'callduration', 'callcharge', 'callcount104',
  'freedialnum', 'source', 'division', 'terminaltype', 'carriertype'];
let ColumnSetNTTOutbound = ['customername', 'parentdid', 'calltype', 'calldate', 'calltime', 'cld', 'destination', 'callduration',
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

  getNTTCustomer: async function () {
    try {
      const query = `select id, customer_cd, customer_name, address, staff_name from  m_customer 
      where is_deleted=false and service_type ->> 'ntt_customer' ='true' order by customer_cd desc`;
      const NTTCustomerListRes = await db.query(query, [], true);
      // console.log(targetDateRes);
      if (NTTCustomerListRes.rows) {
        return NTTCustomerListRes.rows
      }

      throw new Error('Error in fetching customer.' + NTTCustomerListRes)

    } catch (error) {
      console.log("error...." + error.message)
      throw new Error('Error in fetching customer.' + error.message)
    }
  },

  getCustomerList: async function () {
    try {
      const query = `select customer_name, customer_cd, id from m_customer order by customer_cd `
      const getCustomerList = await db.query(query, [], true);
      return getCustomerList.rows;
    } catch (e) {
      console.log("err in get kddi company list=" + e.message);
      return e;
    }
  },

  getNTTFreeDialNumList: async function () {
    try {
      const query = `select data_idno, cust_code__c, carr_comp__c, free_numb__c from  ntt_kddi_freedial_c where carr_comp__c='NTT' `
      const getNTTFreeDialNumListRes = await db.queryByokakin(query, []);
      return getNTTFreeDialNumListRes.rows;
    } catch (e) {
      console.log("err in get ntt free dial number list=" + e.message);
      return e;
    }
  },

  getNTT_N_NumList: async function () {
    try {
      const query = `select id as data_idno, n_number as free_numb__c from ntt_n_number`
      const getNTT_N_NumListRes = await db.queryByokakin(query, []);
      if(getNTT_N_NumListRes.rows)
        return getNTT_N_NumListRes.rows;
      else 
        throw new Error(getNTT_N_NumListRes);
    } catch (e) {
      console.log("err in get ntt free dial number list=" + e.message);
      throw new Error(e.message)
      
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
  getNTTKotehiData: async function ({ year, month, comCode }) {
    try {
      const query = `select row_number() over() as id, * from ntt_koteihi_cdr where  to_char(datebill::date, 'MM-YYYY')='${month}-${year}' `;
      const getNTTKotehiDataRes = await db.queryByokakin(query, []);
      return getNTTKotehiDataRes.rows;
    } catch (e) {
      console.log("err in get ntt kotehi data=" + e.message);
      throw new Error(e);
    }
  },

  getNTTKotehiLastMonthData: async function ({ year, month, comCode }) {
    try {
      let where = "";

      let lastMonthDate = utility.getPreviousYearMonth(`${year}-${month}`);

      const lastYear = lastMonthDate.year;
      const lastMonth = lastMonthDate.month;
      const query = ` select row_number() over() as id, * from ntt_koteihi_cdr where  to_char(datebill::date, 'MM-YYYY')='${lastMonth}-${lastYear}'`;
      const getLastMonthNTTKotehiDataRes = await db.queryByokakin(query, []);
      return getLastMonthNTTKotehiDataRes.rows;
    } catch (e) {
      console.log("err in last month NTT kotehi data=" + e.message);
      return e;
    }
  },
  getNTTKotehiLastMonthProcessedData: async function ({ year, month, comp_code }) {
    try {

      let where = "";
      let lastMonthDate = utility.getPreviousYearMonth(`${year}-${month}`);
      const lastYear = lastMonthDate.year;
      const lastMonth = lastMonthDate.month;
      console.log("year, month, com code.." + year, month, comp_code);

      if (comp_code && year && month) {
        where = ` where to_char(datebill::date, 'MM-YYYY')='${lastMonth}-${lastYear}' and substring(split_part(bill_code, '-',2),4) as comp_code ='${comCode}'`;
      } else if (!comp_code && year && month) {
        where = `where to_char(datebill::date, 'MM-YYYY')='${lastMonth}-${lastYear}'`;
      } else {
        throw new Error('please select billing year and month');
      }

      const query = ` select row_number() over() as id, *, substring(split_part(bill_code, '-',2),4) as comp_code from 
      ntt_koteihi_cdr_bill ${where}`;

      console.log("query...." + query)

      const getNTTKotehiLastMonthDataRes = await db.queryByokakin(query, []);
      return getNTTKotehiLastMonthDataRes.rows;
    } catch (e) {
      console.log("err in get NTT last month list=" + e.message);
      return e;
    }
  },

  getNTTKotehiProcessedData: async function ({ year, month }) {
    try {
      console.log("year, month .." + year, month);
      const query = ` select  row_number() over() as id, substring(split_part(bill_code, '-',2),4) as comp_code,  sum (kingaku) as amount 
      from ntt_koteihi_cdr_bill where to_char(datebill::date, 'MM-YYYY')='${month}-${year}' group by substring(split_part(bill_code, '-',2),4) `;

      console.log("query..."+query)

      const getNTTKotehiProcessedDataRes = await db.queryByokakin(query, []);
      return getNTTKotehiProcessedDataRes.rows;
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

      if (row.length > 0) {
        comCode = selectedData.comp_code;
        comCode4Dig = comCode.slice(comCode.length - 4);
      } else {
        throw new Error('request data not available');
      }
      const query = ` select *, substring(split_part(bill_code, '-',2),4) as comp_code from ntt_koteihi_cdr_bill where   
      to_char(datebill::date, 'MM-YYYY')='${selectedData.month}-${selectedData.year}' and  substring(split_part(bill_code, '-',2),4) = '${comCode4Dig}' `;

      const getNTTKotehiLastMonthDataRes = await db.queryByokakin(query, []);

      if (getNTTKotehiLastMonthDataRes.rows && getNTTKotehiLastMonthDataRes.rows.length > 0) {
        return 'alredy processed';
      } else {

        let tmpData = [];

        const bill_code = `NTT-FIX${comCode.slice(comCode.length - 4)}-${selectedData.year}${selectedData.month}-1`;

        for (let i = 0; i < row.length; i++) {
          let tmpObj = {};

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
          tmpData.push(tmpObj);
        }


        const insertKotehiDataRes = await insertByBatches(tmpData, 'ntt_koteihi_cdr_bill');

        console.log("insertKotehiDataRes.." + JSON.stringify(insertKotehiDataRes));

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
      let query = `select * from byokakin_ntt_koteihi_${billingYear}${billingMonth}`;
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
          tmpObj['carrier'] = kotehiData.rows[i]['carrier_name'];

          tmpData.push(tmpObj);
        }
        insertByBatches(tmpData, 'ntt_koteihi_charge', billingYear, billingMonth);
      }


    } catch (error) {
      console.log("Error in ntt kotehi charging..." + error);
      throw new Error(error);
    }
  },

  getNTTKotehiServiceData: async function () {
    try {
      const query = `select id, product_name from ntt_koteihi_product_details order by product_name asc`
      const getNTTKotehiServiceDataRes = await db.queryByokakin(query, []);
      return getNTTKotehiServiceDataRes.rows;
    } catch (e) {
      console.log("err in get NTT kotehi a  service code company list=" + e.message);
      return e;
    }
  },

  insertNTTKotehiData: async function (filePath1, fileName1, billingYear, billingMonth, carrierName) {

    try {

      let files = [];
      let filesPath = path.join(__dirname, `../ntt/data/${carrierName}/${billingYear}${billingMonth}/Kotehi`);
      files = await readFilesName(filesPath);

      for (let i = 0; i < files.length; i++) {

        let csvData = [];
        let DID = null;
        let carrier = null;
        let fileName = path.join(__dirname, `../ntt/data/${carrierName}/${billingYear}${billingMonth}/Kotehi/${files[i]}`)

        await new Promise(resolve => setTimeout(resolve, 10000));
        let csvstream = fs.createReadStream(fileName)
          .pipe(iconv.decodeStream("Shift_JIS"))
          .pipe(csv.parse())
          .on('data', async function (row) {
            let obj = {};
            csvstream.pause();
            let tmpDID = row[0] != null ? row[0].trim() : null;
            let tmpCarrier = row[1] != null ? row[1].trim() : null;

            if (tmpDID != null && tmpDID != "") {
              if (tmpDID.indexOf("合計") == -1) {
                DID = tmpDID;
              }
            } else if (tmpCarrier != null && tmpCarrier != "") {
              if (tmpCarrier.indexOf("合計") == -1) {
                carrier = tmpCarrier;
              }
            } else {
              if (row[3] != null && row[3].trim() != "") {
                obj['did'] = DID;
                obj['carrier'] = carrier;
                obj['carrier_name'] = carrierName;
                obj['service_name'] = row[2];
                obj['amount'] = row[3].trim().replaceAll(",", "");
                obj['taxclassification'] = row[4];
                obj['date_added'] = `${billingYear}-${billingMonth}-01`;
                obj['dailydisplay'] = row[5].trim();
                csvData.push(obj);
              }
            }
            csvstream.resume();
          })
          .on('end', function () {
            insertByBatches(csvData, 'ntt_koteihi', billingYear, billingMonth);
          })
          .on('error', function (error) {
            console.log("Error" + error.message);
          });
      }
      //  return csvData;
    } catch (error) {
      console.log("Error" + error.message);
      return error;
    }
  },

  insertNTTRAWData: async function (filesPathtest, billingYear, billingMonth, carrier) {

    let files = [];
    let filesPath = path.join(__dirname, `../ntt/data/${carrier}/${billingYear}${billingMonth}/RAW_CDR`);
    files = await readFilesName(filesPath);
    let fileType = carrier == 'NTT' ? '.txt' : '.csv';

    //console.log("actual path and name =" + (files));

    let resData = [];
    let excludedNumberList = ['0366317486', '0366317496', '0366317497', '0366317498', '67067608'];

    try {

      for (let i = 0; i < files.length; i++) {

        let csvDataInbound = [], csvDataOutbound = [], fileName = '';
        console.log("file name ..." + files[i]);

        if (path.extname(files[i]).toLowerCase() == fileType) {
          fileName = path.join(__dirname, `../ntt/data/${carrier}/${billingYear}${billingMonth}/RAW_CDR/${files[i]}`)

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
                    || parentDID == '0354912097' || parentDID == '05038511863') {
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
              const res = insertByBatches(csvDataInbound, 'RAWCDR_INB', billingYear, billingMonth);
              const resOut = insertByBatches(csvDataOutbound, 'RAWCDR_OUT', billingYear, billingMonth);
              resData.push(res);
            })
          console.log("res.." + resData.length);
        }
      }

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
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetNTTKoteihi, tableNameNTTKoteihi);
    } else if (type === 'ntt_koteihi_charge') {
      let tableNameNTTKoteihiCDR = { table: 'ntt_koteihi_cdr' };
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetNTTKoteihiCDR, tableNameNTTKoteihiCDR);

    } else if (type === 'RAWCDR_INB') {

      let tableNameNTTRAWInb = { table: `byokakin_ntt_rawcdr_inbound_${billingYear}${billingMonth}` };
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetNTTInbound, tableNameNTTRAWInb);

    } else if (type === 'RAWCDR_OUT') {

      let tableNameNTTRAWOut = { table: `byokakin_ntt_rawcdr_outbound_${billingYear}${billingMonth}` };
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetNTTOutbound, tableNameNTTRAWOut);

    }

    else if (type == 'ntt_koteihi_cdr_bill') {
      let tableNameNTTKoteihiCDRBILL = { table: 'ntt_koteihi_cdr_bill' };
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetNTTKoteihiCDRBILL, tableNameNTTKoteihiCDRBILL);
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




