var db = require('./../../../config/database');
const { BATCH_SIZE } = require('../../../config/config');
const iconv = require('iconv-lite');

let ColumnSet = ['comp_acco__c', 'companyname', 'recordtype', 'account', 'groupcode', 'basicservicetype', 'freedialnumber', 'basicchargedesc', 'amount', 'taxinclude', 'telcotype', 'datebill'];
let tableName = { table: 'kddi_kotei_cdr_basic' };

let ColumnSetContents = ['comp_acco__c', 'companyname', 'recordtype', 'account', 'groupcode', 'basicservicetype', 'billaccount', 'freedialnumber', 'startdate', 'enddate', 'gendetaildesc', 'basicchargedesc', 'carriercode', 'contentsnumber', 'contentsprovider', 'amount', 'taxinclude', 'datebill'];
let tableNameContents = { table: 'kddi_kotei_cdr_contents' };

let ColumnSetInfini = ['servicecode', 'did', 'usednumber', 'cld', 'calldate', 'calltime', 'callduration', 'source', 'destination', 'terminaltype'];
let tableNameInfini = { table: 'byokakin_kddi_infinidata_202112' };

let ColumnSetKDDIRAW = ['did', 'freedialnum', 'cld', 'calldate', 'calltime', 'callduration', 'source', 'destination', 'callclassi', 'calltype', 'callcharge', 'customercode'];
let tableNameKDDIRAW = { table: 'byokakin_kddi_raw_cdr_202112' };

let ColumnSetKDDIBillDetail = ['bill_numb__c', 'bill_start__c', 'cdrtype', 'cdrid', 'cdrcnt', 'account', 'servicename', 'productname', 'taxinclude', 'amount', 'comp_acco__c'];
let tableNameKDDIBillDetail = { table: 'kddi_kotei_bill_details' };


var fs = require('fs');
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

  getKDDICustomer: async function () {
    try {
      const query = `select m_cus.* from (select id, customer_cd, customer_name, address, staff_name from  m_customer where is_deleted=false)as m_cus join (select * from kddi_customer where deleted=false) as kddi_cus on ( m_cus.customer_cd::int = kddi_cus.customer_code::int) order by m_cus.customer_cd desc`;
      const KDDICustomerListRes = await db.query(query, [], true);
      // console.log(targetDateRes);
      if(KDDICustomerListRes.rows){
        return KDDICustomerListRes.rows
      }

      throw new Error ('Error in fetching customer.'+KDDICustomerListRes)
     
    } catch (error) {
      console.log("error...."+error.message)
      throw new Error ('Error in fetching customer.'+error.message)
    }
  },

  getKDDICustomerList: async function () {
    try {
      const query = `select customer_name, customer_cd, id from m_customer `
      const getKDDICustomerList = await db.queryIBS(query, []);
      return getKDDICustomerList.rows;
    } catch (e) {
      console.log("err in get kddi company list=" + e.message);
      return e;
    }
  },
  getKDDIKotehiABasciData: async function () {
    try {
      const query = `select id, data_code, data_name from kddi_kotehi_a_basic_construct order by data_name`
      const getKDDIKotehiABasciDataRes = await db.queryByokakin(query, []);
      return getKDDIKotehiABasciDataRes.rows;
    } catch (e) {
      console.log("err in get kddi kotehi basic code company list=" + e.message);
      return e;
    }
  },
  getKDDIKotehiAServiceDataData: async function () {
    try {
      const query = `select id, data_code, data_name from kddi_kotehi_a_service_details order by data_name`
      const getKDDIKotehiAServiceDataDataRes = await db.queryByokakin(query, []);
      return getKDDIKotehiAServiceDataDataRes.rows;
    } catch (e) {
      console.log("err in get kddi kotehi a service code company list=" + e.message);
      return e;
    }
  },

  getKDDIKotehiABasicServiceData: async function () {
    try {
      const query = `select id, data_code, data_name from kddi_kotehi_a_product_service order by data_name`
      const getKDDIKotehiABasicServiceDataDataRes = await db.queryByokakin(query, []);
      return getKDDIKotehiABasicServiceDataDataRes.rows;
    } catch (e) {
      console.log("err in get kddi kotehi a Basic service code company list=" + e.message);
      return e;
    }
  },

  getKDDIFreeDialNumList: async function () {
    try {
      const query = `select data_idno, cust_code__c, carr_comp__c, free_numb__c from  ntt_kddi_freedial_c where carr_comp__c='KDDI' `
      const getKDDIFreeDialNumListRes = await db.queryByokakin(query, []);
      return getKDDIFreeDialNumListRes.rows;
    } catch (e) {
      console.log("err in get kddi free dial number list=" + e.message);
      return e;
    }
  },

  getKDDIFreeAccountNumList: async function () {
    try {
      const query = `select carriername, comp_code__c, accountid, usedflag from free_call_account where carriername='KDDI' and usedflag=1`
      const getKDDIFreeAccountNumListRes = await db.queryByokakin(query, []);
      return getKDDIFreeAccountNumListRes.rows;
    } catch (e) {
      console.log("err in get kddi free account number list=" + e.message);
      return e;
    }
  },
  getKDDIKotehiData: async function (reqData) {
    try {
      let billingData = reqData.billingData;
      billingData = '2022-02-1'
      const year = new Date(billingData).getFullYear();
      let month = new Date(billingData).getMonth() + 1;

      if (parseInt(month, 10) < 10) {
        month = '0' + month;
      }

      const query = `select *, ROW_NUMBER() OVER(ORDER BY cdrid) id from ( select cdrid , comp_acco__c, companyname, recordtype, account,
        freedialnumber as billaccount, amount, '' as gendetaildesc, basicchargedesc, datebill    from kddi_kotei_cdr_basic 
        UNION ALL select cdrid ,comp_acco__c, companyname, recordtype, account, billaccount, amount, 
        gendetaildesc, basicchargedesc, datebill from kddi_kotei_cdr_contents ) as foo
        where  to_char(foo.datebill::date, 'MM-YYYY')='${month}-${year}' `;
      const getKDDIKotehiDataRes = await db.queryByokakin(query, []);
      return getKDDIKotehiDataRes.rows;
    } catch (e) {
      console.log("err in get kddi free account number list=" + e.message);
      return e;
    }
  },

  getLastMonthKDDIKotehiData: async function ({year1, month1, comCode}) {
    try {
      let where = "" ;

      let year = "2022", month = "01";

      if(comCode && year && month) {
        where = ` where to_char(bill_start__c::date, 'MM-YYYY')='${month}-${year}' and substring(split_part(bill_numb__c, '-',2),4) as comp_code ='${comCode}'`; 
      }else if(!comCode && year && month) {
        where = `where to_char(bill_start__c::date, 'MM-YYYY')='${month}-${year}'`; 
      }else{
        throw new Error('please select billing year and month');
      }

      const query = `select *, ROW_NUMBER() OVER(ORDER BY cdrid) id from ( select cdrid , comp_acco__c, companyname, recordtype, account,
        freedialnumber as billaccount, amount, '' as gendetaildesc, basicchargedesc, datebill    from kddi_kotei_cdr_basic 
         UNION ALL select cdrid ,comp_acco__c, companyname, recordtype, account, billaccount, amount, 
         gendetaildesc, basicchargedesc, datebill from kddi_kotei_cdr_contents ) as foo
         where  to_char(foo.datebill::date, 'MM-YYYY')='${month}-${year}'  `;
      const getLastMonthKDDIKotehiDataRes = await db.queryByokakin(query, []);
      return getLastMonthKDDIKotehiDataRes.rows;
    } catch (e) {
      console.log("err in last month kddi kotehi data=" + e.message);
      return e;
    }
  },


  getKDDIKotehiLastMonthData: async function ({year, month, comp_code}) {
    try {
      
      let where = "" ;

      console.log("year, month, com code.."+ year, month, comp_code);

      if(comp_code && year && month) {
        where = ` where to_char(bill_start__c::date, 'MM-YYYY')='${month}-${year}' and substring(split_part(bill_numb__c, '-',2),4) as comp_code ='${comCode}'`; 
      }else if(!comp_code && year && month) {
        where = `where to_char(bill_start__c::date, 'MM-YYYY')='01-2022'`; 
      }else{
        throw new Error('please select billing year and month');
      }

      const query = ` select *, substring(split_part(bill_numb__c, '-',2),4) as comp_code from kddi_kotei_bill_details ${where}`;

      console.log("query...." +query)
      const getKDDIKotehiLastMonthDataRes = await db.queryByokakin(query, []);
      return getKDDIKotehiLastMonthDataRes.rows;
    } catch (e) {
      console.log("err in get kddi last month list=" + e.message);
      return e;
    }
  },

  getKDDIKotehiProcessedData: async function ({year, month}) {
    try {
      console.log("year, month .."+ year, month);
      const query = ` select  substring(split_part(bill_numb__c, '-',2),4) as comp_code,  sum (amount) from kddi_kotei_bill_details where to_char(bill_start__c::date, 'MM-YYYY')='${month}-${year}' group by substring(split_part(bill_numb__c, '-',2),4) `;
      const getKDDIKotehiProcessedDataRes = await db.queryByokakin(query, []);
      return getKDDIKotehiProcessedDataRes.rows;
    } catch (e) {
      console.log("err in get kddi last month list=" + e.message);
      return e;
    }
  },
 
  deleteKotehiProcessedData: async function ({billing_month, customer_cd, deleted_by}) {
    try {
      console.log("year, month .."+ billing_month, customer_cd);

      const query = `delete from kddi_kotei_bill_details where to_char(bill_start__c,'YYYY-MM') ='${billing_month}' and comp_acco__c='${customer_cd}' `;
      const deleteKotehiProcessedDataRes = await db.queryByokakin(query, []);

      console.log(JSON.stringify(deleteKotehiProcessedDataRes))
      
      return deleteKotehiProcessedDataRes;
    } catch (e) {
      console.log("err in get kddi last month list=" + e.message);
      return e;
    }
  },
  

  addKotehiData: async function (reqData) {

//    console.log("data..."+ JSON.stringify(reqData));
  try {
      
      const [{data} , {currentUser}] = reqData;

      let billingData = reqData.billingData;
      billingData = '2022-02-01'
      const year = new Date(billingData).getFullYear();
      let month = new Date(billingData).getMonth() + 1;
      if (parseInt(month, 10) < 10) {
        month = '0' + month;
      }

      let comCode = ''
      let comCode4Dig= '';
      if(data.length>0){
        comCode =  data[0]['comp_acco__c']
        comCode4Dig = comCode.slice(comCode.length - 4);
      }else{
         throw new Error('request data not available');
      }
      
      const query = ` select *, substring(split_part(bill_numb__c, '-',2),4) as comp_code from kddi_kotei_bill_details where   
      to_char(bill_start__c::date, 'MM-YYYY')='${month}-${year}' and  substring(split_part(bill_numb__c, '-',2),4) = '${comCode4Dig}' `;

      const getKDDIKotehiLastMonthDataRes = await db.queryByokakin(query, []);

      if (getKDDIKotehiLastMonthDataRes.rows && getKDDIKotehiLastMonthDataRes.rows.length > 0) {
        return 'alredy processed';
      }else{

        let tmpData = [];

        const bill_numb__c = `KDDI-FIX${comCode.slice(comCode.length - 4)}-${year}${month}-1`;

        for(let i=0; i<data.length; i++){
          let tmpObj = {};

          tmpObj['cdrid'] = data[i]['cdrid'];
          tmpObj['companyname'] = data[i]['companyname'];
          tmpObj['comp_acco__c'] = data[i]['comp_acco__c'];
          tmpObj['bill_numb__c'] = bill_numb__c;
          tmpObj['bill_start__c'] = `${year}-${month}-01`;
          tmpObj['cdrtype'] = data[i]['cdrtype'];
          tmpObj['cdrcnt'] = data[i]['cdrcnt'];
          tmpObj['account'] = data[i]['account'];
          tmpObj['servicename'] = data[i]['servicename'];
          tmpObj['productname'] = data[i]['product_name'];
          tmpObj['taxinclude'] = '課税';
          tmpObj['amount'] = data[i]['amount'];
          tmpData.push(tmpObj);
        }

          
        const insertKotehiDataRes = await insertByBatches(tmpData, 'kddi_kotehi_bill_detail');
  
        console.log("insertKotehiDataRes.."+ JSON.stringify(insertKotehiDataRes));

        if (insertKotehiDataRes.length>0 && insertKotehiDataRes[0]== null) {
          return 'done';
        }else{
          throw new Error(insertKotehiDataRes);
        }
      }

    } catch (e) {
      console.log("err in get kddi free account number list=" + e.message);
      throw new Error(e.message);      
    }
  },


  deleteTargetDateCDR: async function (billingMonth, billingYear, serviceType, callType) {

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
  insertKDDIKotehiData: async function (filePath, fileName, resKDDICustomerList, resKDDIFreeDialNumList, resKDDIFreeAccountNumList,billingMonth) {

    console.log("path and name =" + filePath + fileName);


    // var stripBomStream = require('strip-bom-stream')

    console.log("111" + __dirname);
    try {

      let csvData = [];
      let csvDataContents = [];
      let csvInfiniData = [];
      let csvstream = fs.createReadStream('NTCD202203BTU09118002_00.CSV')
        .pipe(csv.parse())
        .on('data', async function (row) {

          let obj = {};
          let obj1 = {};
          let obj2 = {};
          if (parseInt(row[0]) == 22) {
            csvstream.pause();
            let callToNum = row[4];
            callToNum = callToNum.replace("-", "");
            callToNum = callToNum.replace("_", "");
            callToNum = callToNum.replace(" ", "");
            const comCode = await getCompanyCode(resKDDIFreeDialNumList, callToNum);
            const companyName = await getCompanyName(resKDDICustomerList, comCode);
            obj['comp_acco__c'] = comCode;
            obj['companyname'] = companyName;
            obj['recordtype'] = parseInt(row[0]);
            obj['account'] = row[1];
            obj['groupcode'] = row[2];
            obj['basicservicetype'] = row[3];
            obj['freedialnumber'] = callToNum;
            obj['basicchargedesc'] = row[5];
            obj['amount'] = parseInt(row[6], 10);
            obj['taxinclude'] = row[7];
            obj['telcotype'] = row[8];
            obj['datebill'] = billingMonth;
            csvData.push(obj);
            csvstream.resume();

          } else if (parseInt(row[0]) === 24 || parseInt(row[0]) === 25) {
            csvstream.pause();
            let callToNum = row[5];
            callToNum = callToNum.replace("-", "");
            callToNum = callToNum.replace("_", "");
            callToNum = callToNum.replace(" ", "");

            const comCode = await getCompanyCodeByAccount(resKDDIFreeAccountNumList, row[4]);
            const companyName = await getCompanyName(resKDDICustomerList, comCode);
            obj1['comp_acco__c'] = comCode;
            obj1['companyname'] = companyName;
            obj1['recordtype'] = parseInt(row[0]);
            obj1['account'] = row[1];
            obj1['groupcode'] = row[2];
            obj1['basicservicetype'] = row[3];
            obj1['billaccount'] = row[4];
            obj1['freedialnumber'] = callToNum;
            obj1['startdate'] = row[6];
            obj1['enddate'] = row[7];
            obj1['gendetaildesc'] = row[8];
            obj1['basicchargedesc'] = row[9];
            obj1['carriercode'] = row[10];
            obj1['contentsnumber'] = row[11];
            obj1['contentsprovider'] = row[12];
            obj1['amount'] = parseInt(row[13]);
            obj1['taxinclude'] = row[14];
            obj1['datebill'] = billingMonth;

            csvDataContents.push(obj1);
            csvstream.resume();
          } else if (parseInt(row[0]) === 20) {
            csvstream.pause();
            obj2['servicecode'] = row[3];
            obj2['did'] = row[4];
            obj2['usednumber'] = row[8];
            obj2['cld'] = row[9];
            obj2['calldate'] = row[10];
            obj2['calltime'] = row[11];
            obj2['callduration'] = parseInt(row[12], 10);
            obj2['source'] = row[13];
            obj2['destination'] = row[14];
            obj2['terminaltype'] = row[15];
            csvInfiniData.push(obj2);
            csvstream.resume();

          }
        })
        .on('end', function () {
          insertByBatches(csvData);
          insertByBatches(csvDataContents, 'contents');
          insertByBatches(csvInfiniData, 'infini');
        })
        .on('error', function (error) {
          console.log("Error" + error.message);
        });
      return csvData;
    } catch (error) {
      console.log("Error" + error.message);
      return error;
    }
  },

  insertKDDIRAWData: async function (filesPathtest) {
    console.log("path and name =" + __dirname);

    let filesPath = path.join(__dirname, '../RAWCDR/202112')
    let filePath = '';

    console.log("actual path and name =" + filesPath);



    try {

      //    let csvData = [];
      let csvstream;
      fs.readdir(filesPath, (err, files) => {
        if (err) {
          console.log("error in reading files name.." + err);
          throw new Error(err);
        }
        for (let i = 0; i < files.length; i++) {
          let csvData = [];
          if (path.extname(files[i]).toLowerCase() == ".csv") {
            filePath = path.join(__dirname, `../RAWCDR/202112/${files[i]}`)
            csvstream = fs.createReadStream(filePath)
              .pipe(iconv.decodeStream("Shift_JIS"))
              .pipe(csv.parse())
              .on('data', function (row) {
                let obj = {};
                obj['did'] = row[0];
                obj['freedialnum'] = '';
                obj['calldate'] = '2021-01-01';
                obj['calltime'] = '';
                obj['cld'] = row[3];
                obj['source'] = '';
                obj['destination'] = row[4];
                obj['callduration'] = row[5];
                obj['callclassi'] = row[6];
                obj['calltype'] = row[7];
                obj['callcharge'] = 0;
                obj['customercode'] = '';
                csvData.push(obj);
                csvstream.resume();
              })
              .on('end', function () {
                csvData.shift();
                insertByBatches(csvData, 'RAWCDR');

              })
              .on('error', function (error) {
                console.log("Error" + error.message);
              });
          }
        }
      })


    } catch (error) {
      console.log("Error" + error.message);
      return error;
    }
  },


}

async function insertByBatches(records, type) {
  const chunkArray = chunk(records, BATCH_SIZE);
  let res = [];
  let resArr = [];

  for (let i = 0; i < chunkArray.length; i++) {
    if (type === 'contents') {
      res = await db.queryBatchInsert(chunkArray[i], null, ColumnSetContents, tableNameContents);
    } else if (type === 'infini') {
      res = await db.queryBatchInsert(chunkArray[i], null, ColumnSetInfini, tableNameInfini);
    } else if (type === 'RAWCDR') {
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetKDDIRAW, tableNameKDDIRAW);
    } else if(type == 'kddi_kotehi_bill_detail'){
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetKDDIBillDetail, tableNameKDDIBillDetail);
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
    return res;
  } catch (err) {
    console.log("Error in parsing company code..." + err.message)
  }

}

async function getCompanyCode(companyCodeList, callToNum) {
  let res = '99999999';
  try {
    for (let i = 0; i < companyCodeList.length; i++) {
      if (callToNum == companyCodeList[i]['free_numb__c'].trim()) {
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




