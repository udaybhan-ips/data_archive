var db = require('./../../../config/database');
const { BATCH_SIZE } = require('../../../config/config');
const iconv = require('iconv-lite');
const utility = require("../../../public/javascripts/utility")

let ColumnSet = ['comp_acco__c', 'companyname', 'recordtype', 'account', 'groupcode', 'basicservicetype', 'freedialnumber', 'basicchargedesc', 'amount', 'taxinclude', 'telcotype', 'datebill'];
let tableName = { table: 'kddi_kotei_cdr_basic' };

let ColumnSetContents = ['comp_acco__c', 'companyname', 'recordtype', 'account', 'groupcode', 'basicservicetype', 'billaccount', 'freedialnumber', 'startdate', 'enddate', 'gendetaildesc', 'basicchargedesc', 'carriercode', 'contentsnumber', 'contentsprovider', 'amount', 'taxinclude', 'datebill'];
let tableNameContents = { table: 'kddi_kotei_cdr_contents' };

let ColumnSetInfini = ['servicecode', 'did', 'usednumber', 'cld', 'calldate', 'calltime', 'callduration', 'source', 'destination', 'terminaltype'];


let ColumnSetKDDIRAW = ['did', 'freedialnum', 'cld', 'calldate', 'calltime', 'callduration', 'source', 'destination', 'callclassi', 'calltype', 'callcharge', 'customercode'];


let ColumnSetKDDIBillDetail = ['bill_numb__c', 'bill_start__c', 'cdrtype', 'cdrid', 'cdrcnt', 'account', 'servicename', 'productname', 'taxinclude', 
'amount', 'comp_acco__c','ips_amount'];
let tableNameKDDIBillDetail = { table: 'kddi_kotei_bill_details' };


var fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
var csv = require('fast-csv');


module.exports = {

  checkTableExist: async function (tableName, database = "byokakin") {
    try {
      let checkTableExistRes = false;
      const query = `SELECT EXISTS ( SELECT FROM information_schema.tables WHERE  table_schema ='public' AND table_name = '${tableName}' )`;
      if (database === "byokakin") {
        checkTableExistRes = await db.queryByokakin(query, []);
      } else {
        checkTableExistRes = await db.query(query, []);
      }

      if (checkTableExistRes && checkTableExistRes.rows) {
        return checkTableExistRes.rows[0]['exists']
      }
      return checkTableExistRes;

    } catch (e) {
      console.log("err in get table=" + e.message);
      throw new Error("Error in checking table exist!!" + e.message)
    }
  },

  createKDDITables: async function (year, month) {
    try {

      const query1 = `CREATE TABLE IF NOT EXISTS byokakin_kddi_infinidata_${year}${month} (cdrid serial, servicecode varchar(30), did varchar(30), usednumber varchar(30), cld varchar(30), calldate varchar(15), calltime varchar(15), callduration varchar(15), source varchar, destination varchar, terminaltype varchar)`;
      const query2 = `CREATE TABLE IF NOT EXISTS byokakin_kddi_processedcdr_${year}${month} (cdrid bigint, cdrclassification varchar(10), customercode varchar(10), terminaltype varchar(10),freedialnumber varchar(30), callingnumber varchar(30), calldate varchar(30), calltime varchar(15), callduration varchar(15), cld varchar(30), sourcearea varchar, destinationarea varchar, cdrcallcharge numeric(16,5), callrate  numeric(16,5),finalcallcharge numeric(16,5), vendorcallcharge numeric(16,5) )`;
      const query3 = `CREATE TABLE IF NOT EXISTS byokakin_kddi_raw_cdr_${year}${month} (cdrid serial, did varchar(30), freedialnum varchar(30),   cld varchar(30), calldate timestamp without time zone, calltime varchar(15), callduration varchar(15), source varchar, destination varchar, callclassi varchar, calltype varchar, callcharge numeric(16,5), customercode varchar(10))`;


      const tableCreationRes1 = await db.queryByokakin(query1, []);
      const tableCreationRes2 = await db.queryByokakin(query2, []);
      const tableCreationRes3 = await db.queryByokakin(query3, []);

      if (tableCreationRes1 && tableCreationRes2 && tableCreationRes3) {
        return tableCreationRes1;
      }

      throw new Error("Error while creating table..." + tableCreationRes1)

    } catch (e) {
      throw new Error("Error while creating table..." + e.message)
    }
  },


  getTableName: async function (targetDate, __type) {
    try {
      const year = new Date(targetDate).getFullYear();
      let month = new Date(targetDate).getMonth() + 1;

      if (parseInt(month, 10) < 10) {
        month = '0' + month;
      }

      if (__type === 'billcdr') {
        return `billcdr_${year}${month}`;
      } else {
        return `cdr_${year}${month}`;
      }

    } catch (e) {
      console.log("err in get table=" + e.message);
      return console.error(e);
    }
  },

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
      const query = `select id, customer_cd, customer_name, address, staff_name from  
        m_customer where is_deleted=false and service_type ->> 'kddi_customer' ='true' order by customer_cd desc`;
      const KDDICustomerListRes = await db.query(query, [], true);

      if (KDDICustomerListRes.rows) {
        return KDDICustomerListRes.rows
      }

      throw new Error('Error in fetching customer.' + KDDICustomerListRes)

    } catch (error) {
      console.log("error...." + error.message)
      throw new Error('Error in fetching customer.' + error.message)
    }
  },

  getKDDICustomerList: async function () {
    try {
      const query = `select customer_name, customer_cd, id from m_customer `

      const getKDDICustomerList = await db.query(query, [], true);
      if (getKDDICustomerList && getKDDICustomerList.rows) {
        return getKDDICustomerList.rows;
      } else {
        return 'Not found'
      }

    } catch (e) {
      console.log("err in get kddi company list=" + e.message);
      throw new Error("Error in fetching customer details..." + e.message);
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
      const query = `select data_idno, cust_code__c, carr_comp__c, free_numb__c from  ntt_kddi_freedial_c 
      where carr_comp__c='KDDI' order by free_numb__c`
      const getKDDIFreeDialNumListRes = await db.queryByokakin(query, []);
      return getKDDIFreeDialNumListRes.rows;
    } catch (e) {
      console.log("err in get kddi free dial number list=" + e.message);
      return e;
    }
  },

  getKDDIFreeAccountNumList: async function () {
    try {
      const query = `select carriername, comp_code__c, accountid, usedflag from free_call_account 
      where carriername='KDDI' and usedflag = '1' and deleted =false `
      const getKDDIFreeAccountNumListRes = await db.queryByokakin(query, []);
      return getKDDIFreeAccountNumListRes.rows;
    } catch (e) {
      console.log("err in get kddi free account number list=" + e.message);
      return e;
    }
  },

  getAdditionalKotehiData: async function (data) {
    try {
      let carrierWhere = "";
      if (data.carrier !== '' && data.carrier !== undefined && data.carrier !== null) {
        carrierWhere = `and carrier = '${data.carrier}'`;
      }
      const query = ` SELECT * from ntt_kddi_additional_kotehi_detail where deleted = false ${carrierWhere} `;
      const getAdditionalKotehiDataRes = await db.queryByokakin(query, []);
      if (getAdditionalKotehiDataRes && getAdditionalKotehiDataRes.rows)
        return getAdditionalKotehiDataRes.rows;
      else
        throw new Error(getAdditionalKotehiDataRes);
    } catch (e) {
      console.log("err in get kddi free account number list=" + e.message);
      throw new Error(e.message);
    }
  },

  getKDDIKotehiData: async function ({ year, month, comCode }) {
    try {
      let lastMonthDate = utility.getPreviousYearMonth(`${year}-${month}`);

      const lastYear = lastMonthDate.year;
      const lastMonth = lastMonthDate.month;

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

  getLastMonthKDDIKotehiData: async function ({ year, month, comCode }) {
    try {
      let where = "";

      let lastMonthDate = utility.getPreviousYearMonth(`${year}-${month}`);

      const lastYear = lastMonthDate.year;
      const lastMonth = lastMonthDate.month;

      if (comCode && year && month) {
        where = ` where to_char(bill_start__c::date, 'MM-YYYY')='${lastMonth}-${lastYear}' and substring(split_part(bill_numb__c, '-',2),4) as comp_code ='${comCode}'`;
      } else if (!comCode && lastMonth && lastYear) {
        where = `where to_char(bill_start__c::date, 'MM-YYYY')='${lastMonth}-${lastYear}'`;
      } else {
        throw new Error('please select billing year and month');
      }

      const query = `select *, ROW_NUMBER() OVER(ORDER BY cdrid) id from ( select cdrid , comp_acco__c, companyname, recordtype, account,
        freedialnumber as billaccount, amount, '' as gendetaildesc, basicchargedesc, datebill    from kddi_kotei_cdr_basic 
         UNION ALL select cdrid ,comp_acco__c, companyname, recordtype, account, billaccount, amount, 
         gendetaildesc, basicchargedesc, datebill from kddi_kotei_cdr_contents ) as foo
         where  to_char(foo.datebill::date, 'MM-YYYY')='${lastMonth}-${lastYear}'  `;
      const getLastMonthKDDIKotehiDataRes = await db.queryByokakin(query, []);
      return getLastMonthKDDIKotehiDataRes.rows;
    } catch (e) {
      console.log("err in last month kddi kotehi data=" + e.message);
      return e;
    }
  },


  getKDDIKotehiLastMonthData: async function ({ year, month, comp_code }) {
    try {

      let where = "";

      let lastMonthDate = utility.getPreviousYearMonth(`${year}-${month}`);

      const lastYear = lastMonthDate.year;
      const lastMonth = lastMonthDate.month;


      console.log("year, month, com code.." + year, month, comp_code);

      if (comp_code && year && month) {
        where = ` where to_char(bill_start__c::date, 'MM-YYYY')='${lastMonth}-${lastYear}' and substring(split_part(bill_numb__c, '-',2),4) as comp_code ='${comp_code}'`;
      } else if (!comp_code && year && month) {
        where = `where to_char(bill_start__c::date, 'MM-YYYY')='${lastMonth}-${lastYear}'`;
      } else {
        throw new Error('please select billing year and month');
      }

      const query = ` select *, substring(split_part(bill_numb__c, '-',2),4) as comp_code from kddi_kotei_bill_details ${where}`;

      console.log("query...." + query)
      const getKDDIKotehiLastMonthDataRes = await db.queryByokakin(query, []);
      return getKDDIKotehiLastMonthDataRes.rows;
    } catch (e) {
      console.log("err in get kddi last month list=" + e.message);
      return e;
    }
  },

  getKDDIKotehiProcessedData: async function ({ year, month }) {
    try {
      console.log("year, month .." + year, month);

      const query = `select id, bill_numb__c, comp_acco__c,  account, productname, amount, ips_amount from
      kddi_kotei_bill_details where to_char(bill_start__c::date, 'MM-YYYY')='${month}-${year}' `;
     
     const  summaryQuery = ` select  id , date_added, added_by, substring(comp_acco__c,5) as comp_code, amount from 
     kddi_kotei_bill_summary where to_char(bill_start__c::date, 'MM-YYYY') ='${month}-${year}' 
       and deleted=false  `;

     //console.log("query..." + query)

     const getKDDIKotehiProcessedDataRes = await db.queryByokakin(query, []);

     const getKDDIKotehiProcessedDataSummaryRes = await db.queryByokakin(summaryQuery, []);
     
     return {details:getKDDIKotehiProcessedDataRes.rows, summary:getKDDIKotehiProcessedDataSummaryRes.rows};

    } catch (e) {
      console.log("err in get kddi last month list=" + e.message);
      return e;
    }
  },

  
  updateKotehiProcessedData: async function ({updated_by, records, selectedData, totalAmount}) {
    try {

      //console.log("req is "+JSON.stringify(records))
      //console.log("req is "+JSON.stringify(selectedData))

      if(records && records.length>0){
        let customerCode = records[0]['comp_acco__c'];

        let updateRecordsCount = 0

        for(let i=0; i<records.length; i++){
          let updateQuery = `update kddi_kotei_bill_details set amount=${records[i]['amount']}, updated_by='${updated_by}' , updated_date=now()
           where id='${records[i]['id']}'  `;

           //console.log("update query is "+updateQuery)

           let resData = await db.queryByokakin(updateQuery,[]);
           updateRecordsCount += resData.rowCount;
           //console.log("res data" + JSON.stringify(resData));

        }

          let updateSummaryQuery = `update kddi_kotei_bill_summary set amount=${totalAmount} , updated_by='${updated_by}',
          updated_date=now() where bill_start__c::date ='${selectedData.year}-${selectedData.month}-01' and 
          comp_acco__c='${customerCode}'  and deleted= false `; 

          //console.log("update query is "+updateSummaryQuery)

          let resSummary = await db.queryByokakin(updateSummaryQuery, []);

          return updateRecordsCount;
          

      }else{
        throw new Error('Request is invalid!');
      }

    } catch (e) {
      console.log("err in get kddi last month list=" + e.message);
      return e;
    }
  },

  deleteKotehiProcessedData: async function ({ billing_month, customer_cd, deleted_by }) {
    try {
      console.log("year, month .." + billing_month, customer_cd);

      const query = `delete from kddi_kotei_bill_details where to_char(bill_start__c,'YYYY-MM') ='${billing_month}' 
      and comp_acco__c='${customer_cd}' `;

      const querySumarry = `update kddi_kotei_bill_summary set deleted = true, deleted_by='${deleted_by}' 
      where to_char(bill_start__c,'YYYY-MM') ='${billing_month}' and comp_acco__c='${customer_cd}' `;

      const deleteKotehiProcessedDataRes = await db.queryByokakin(query, []);
      const deleteKotehiProcessedSummaryDataRes = await db.queryByokakin(querySumarry, []);

      //console.log(JSON.stringify(deleteKotehiProcessedDataRes))


      return deleteKotehiProcessedDataRes;
    } catch (e) {
      console.log("err in get kddi last month list=" + e.message);
      return e;
    }
  },


  addKotehiData: async function (reqData) {

    console.log("data..." + JSON.stringify(reqData));
    try {
      const [{ data }, { currentUser }] = reqData;
      let billingData, comCode = '', comCode4Dig = '';

      if (data.length > 0) {
        comCode = data[0]['comp_acco__c']
        comCode4Dig = comCode.slice(comCode.length - 4);
        billingData = data[0]['datebill'];
      } else {
        throw new Error('request data not available');
      }

      const year = new Date(billingData).getFullYear();
      let month = new Date(billingData).getMonth() + 1;
      if (parseInt(month, 10) < 10) {
        month = '0' + month;
      }

      const query = ` select *, substring(split_part(bill_numb__c, '-',2),4) as comp_code from kddi_kotei_bill_details where   
      to_char(bill_start__c::date, 'MM-YYYY')='${month}-${year}' and  substring(split_part(bill_numb__c, '-',2),4) = '${comCode4Dig}' `;

      const getKDDIKotehiLastMonthDataRes = await db.queryByokakin(query, []);

      if (getKDDIKotehiLastMonthDataRes.rows && getKDDIKotehiLastMonthDataRes.rows.length > 0) {
        return 'alredy processed';
      } else {

        let tmpData = [];

        const bill_numb__c = `KDDI-FIX${comCode.slice(comCode.length - 4)}-${year}${month}-1`;
        let amount = 0, ips_amount = 0;
        for (let i = 0; i < data.length; i++) {
          let tmpObj = {}, ipsAmount = 0;
          amount += parseFloat(data[i]['amount']) ;
          if(data[i]['ips_amount']!==undefined && data[i]['ips_amount']!==null && data[i]['ips_amount']!==''){
            ips_amount += parseFloat(data[i]['ips_amount']);
            ipsAmount = data[i]['ips_amount'];
          }
          else{
            ips_amount = 0;
          }
          tmpObj['cdrid'] = data[i]['cdrid'];
          tmpObj['companyname'] = data[i]['companyname'];
          tmpObj['comp_acco__c'] = data[i]['comp_acco__c'];
          tmpObj['bill_numb__c'] = bill_numb__c;
          tmpObj['bill_start__c'] = `${year}-${month}-01`;
          tmpObj['cdrtype'] = data[i]['cdrtype'];
          tmpObj['cdrcnt'] = data[i]['cdrcnt'];
          tmpObj['account'] = data[i]['billaccount'];
          tmpObj['servicename'] = data[i]['servicename'];
          tmpObj['productname'] = data[i]['product_name'];
          tmpObj['taxinclude'] = '課税';
          tmpObj['amount'] = data[i]['amount'];
          tmpObj['ips_amount'] = ipsAmount;
          tmpData.push(tmpObj);
        }


        const insertKotehiDataRes = await insertByBatches(tmpData, 'kddi_kotehi_bill_detail');

        const insertKotehiSummaryData = `insert into kddi_kotei_bill_summary (bill_numb__c, bill_start__c, amount, 
          comp_acco__c, date_added, added_by, ips_amount) values ('${bill_numb__c}','${year}-${month}-01','${amount}',
          '${comCode}',now(),'${currentUser}', '${ips_amount}') ` ;

          console.log("insertKotehiSummaryData is.."+ insertKotehiSummaryData);

        const insertKotehiSummaryDataRes = await db.queryByokakin(insertKotehiSummaryData,[]);

       // console.log("insertKotehiDataRes.." + JSON.stringify(insertKotehiDataRes));

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
  insertKDDIKotehiData: async function (filePath, fileName_C, resKDDICustomerList, resKDDIFreeDialNumList, resKDDIFreeAccountNumList, billingYear, billingMonth) {

    //console.log("path and name =" + filePath );


    // var stripBomStream = require('strip-bom-stream')

    console.log("111" + __dirname);

    let files = [];
    let filesPath = path.join(__dirname, `../kddi/data/${billingYear}${billingMonth}/Kotehi`);
    files = await readFilesName(filesPath);
    try {
      for (let i = 0; i < files.length; i++) {
        let csvData = [];
        let csvDataContents = [];
        let csvInfiniData = [];

        if (path.extname(files[i]).toLowerCase() == ".csv") {
          const fileName = path.join(__dirname, `../kddi/data/${billingYear}${billingMonth}/Kotehi/${files[i]}`)

          let csvstream = fs.createReadStream(fileName)
            .pipe(iconv.decodeStream("Shift_JIS"))
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
                obj['datebill'] = `${billingYear}-${billingMonth}-01`;
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
                obj1['datebill'] = `${billingYear}-${billingMonth}-01`;
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
              insertByBatches(csvDataContents, 'contents', billingYear, billingMonth);
              insertByBatches(csvInfiniData, 'infini', billingYear, billingMonth);
            })
            .on('error', function (error) {
              console.log("Error" + error.message);
            });
        }
      }
    } catch (error) {
      console.log("Error" + error.message);
      return error;
    }
  },


  checkTargetKotehiData: async function (billingYear, billingMonth, serviceType) {

    try {

      const query = `select * from kddi_kotei_cdr_basic where to_char(datebill::date, 'MM-YYYY')= '${billingMonth}-${billingYear}' `;
      const query1 = `select * from kddi_kotei_cdr_contents where to_char(datebill::date, 'MM-YYYY')= '${billingMonth}-${billingYear}' `;
      const query2 = `select * from byokakin_kddi_infinidata_${billingYear}${billingMonth} limit 1`;

      const qRes = await db.queryByokakin(query, []);
      const qRes1 = await db.queryByokakin(query1, []);
      const qRes2 = await db.queryByokakin(query2, []);

      if (qRes && qRes.rows.length <= 0 && qRes1 && qRes1.rows.length <= 0 && qRes2 && qRes2.rows.length <= 0) {
        return "data_not_available"
      } else {
        return "data is already there";
      }
    } catch (error) {
      throw new Error("Error!!" + error.message)
    }
  },

  deleteTargetKotehiData: async function (billingYear, billingMonth, serviceType) {

    try {

      const query = `delete from kddi_kotei_cdr_basic where to_char(datebill::date, 'MM-YYYY')= '${billingMonth}-${billingYear}' `;
      const query1 = `delete from kddi_kotei_cdr_contents where to_char(datebill::date, 'MM-YYYY')= '${billingMonth}-${billingYear}' `;
      const query2 = `delete from byokakin_kddi_infinidata_${billingYear}${billingMonth}`;

      const qRes = await db.queryByokakin(query, []);
      const qRes1 = await db.queryByokakin(query1, []);
      const qRes2 = await db.queryByokakin(query2, []);

      if (qRes && qRes1 && qRes2) {
        return "record deleted"
      }

    } catch (error) {
      throw new Error("Error!!" + error.message)
    }
  },


  checkUnRegistededKotehiNumber: async function (billingYear, billingMonth, serviceType) {

    try {

      let res = { message: 'not_found', cdr_basic: [], cdr_contents: [] };


      const query1 = `select  distinct(freedialnumber) as freedialnumber from kddi_kotei_cdr_basic where datebill::date ='${billingYear}-${billingMonth}-01' and comp_acco__c='99999999' `;
      const query2 = `select  distinct(billaccount) as billaccount from kddi_kotei_cdr_contents where datebill::date ='${billingYear}-${billingMonth}-01' and comp_acco__c='99999999' `;

      const qRes1 = await db.queryByokakin(query1, []);
      const qRes2 = await db.queryByokakin(query2, []);

      if (qRes1 && qRes1.rows.length > 0) {
        res.cdr_basic = qRes1.rows;
        res.message = 'found';
      }

      if (qRes2 && qRes2.rows.length > 0) {
        res.message = 'found';
        res.cdr_contents = qRes2.rows;
      }
      return res;

    } catch (error) {
      throw new Error("Error!!" + error.message)
    }
  },


  insertKDDIKotehiDataByAPI: async function (data, resKDDICustomerList, resKDDIFreeDialNumList, resKDDIFreeAccountNumList, billingYear, billingMonth) {

    try {
      let csvData = [];
      let csvDataContents = [];
      let csvInfiniData = [];

      console.log("type of .." + typeof (data));

      if (data) {

        for (let i = 0; i < data.length; i++) {

          let obj = {};
          let obj1 = {};
          let obj2 = {};

          if (parseInt(data[i][0]) == 22) {

            let callToNum = data[i][4];
            callToNum = callToNum.replace("-", "");
            callToNum = callToNum.replace("_", "");
            callToNum = callToNum.replace(" ", "");
            const comCode = await getCompanyCode(resKDDIFreeDialNumList, callToNum);
            const companyName = await getCompanyName(resKDDICustomerList, comCode);
            obj['comp_acco__c'] = comCode;
            obj['companyname'] = companyName;
            obj['recordtype'] = parseInt(data[i][0]);
            obj['account'] = data[i][1];
            obj['groupcode'] = data[i][2];
            obj['basicservicetype'] = data[i][3];
            obj['freedialnumber'] = callToNum;
            obj['basicchargedesc'] = data[i][5];
            obj['amount'] = parseInt(data[i][6], 10);
            obj['taxinclude'] = data[i][7];
            obj['telcotype'] = data[i][8];
            obj['datebill'] = `${billingYear}-${billingMonth}-01`;
            csvData.push(obj);
          } else if (parseInt(data[i][0]) === 24 || parseInt(data[i][0]) === 25) {

            let callToNum = data[i][5];
            callToNum = callToNum.replace("-", "");
            callToNum = callToNum.replace("_", "");
            callToNum = callToNum.replace(" ", "");

            const comCode = await getCompanyCodeByAccount(resKDDIFreeAccountNumList, data[i][4]);
            const companyName = await getCompanyName(resKDDICustomerList, comCode);
            obj1['comp_acco__c'] = comCode;
            obj1['companyname'] = companyName;
            obj1['recordtype'] = parseInt(data[i][0]);
            obj1['account'] = data[i][1];
            obj1['groupcode'] = data[i][2];
            obj1['basicservicetype'] = data[i][3];
            obj1['billaccount'] = data[i][4];
            obj1['freedialnumber'] = callToNum;
            obj1['startdate'] = data[i][6];
            obj1['enddate'] = data[i][7];
            obj1['gendetaildesc'] = data[i][8];
            obj1['basicchargedesc'] = data[i][9];
            obj1['carriercode'] = data[i][10];
            obj1['contentsnumber'] = data[i][11];
            obj1['contentsprovider'] = data[i][12];
            obj1['amount'] = parseInt(data[i][13]);
            obj1['taxinclude'] = data[i][14];
            obj1['datebill'] = `${billingYear}-${billingMonth}-01`;

            csvDataContents.push(obj1);

          } else if (parseInt(data[i][0]) === 20) {

            obj2['servicecode'] = data[i][3];
            obj2['did'] = data[i][4];
            obj2['usednumber'] = data[i][8];
            obj2['cld'] = data[i][9];
            obj2['calldate'] = data[i][10];
            obj2['calltime'] = data[i][11];
            obj2['callduration'] = parseInt(data[i][12], 10);
            obj2['source'] = data[i][13];
            obj2['destination'] = data[i][14];
            obj2['terminaltype'] = data[i][15];
            csvInfiniData.push(obj2);

          }
        }


        //        console.log("csvData..." + JSON.stringify(csvData))

        await insertByBatches(csvData);
        await insertByBatches(csvDataContents, 'contents', billingYear, billingMonth);
        await insertByBatches(csvInfiniData, 'infini', billingYear, billingMonth);

      }

    } catch (error) {
      console.log("Error" + error.message);
      return error;
    }
  },


  insertKDDIRAWData: async function (filesPathtest, billingYear, billingMonth) {

    let files = [];
    let filesPath = path.join(__dirname, `../kddi/data/${billingYear}${billingMonth}/RAW_CDR`);
    files = await readFilesName(filesPath);
    //console.log("actual path and name =" + (files));

    let resData = [];

    try {

      for (let i = 0; i < files.length; i++) {

        let csvData = [], fileName = '';
        console.log("file name ..." + files[i]);

        if (path.extname(files[i]).toLowerCase() == ".csv") {
          fileName = path.join(__dirname, `../kddi/data/${billingYear}${billingMonth}/RAW_CDR/${files[i]}`)

          await new Promise(resolve => setTimeout(resolve, 10000));
          let csvstream = fs.createReadStream(fileName)
            .pipe(iconv.decodeStream("Shift_JIS"))
            .pipe(csv.parse())

            .on('data', function (row) {
              let obj = {};
              obj['did'] = row[0];
              obj['freedialnum'] = '';
              obj['calldate'] = row[1];
              obj['calltime'] = row[2];
              obj['cld'] = row[3];
              obj['source'] = '';
              obj['destination'] = row[4];
              obj['callduration'] = row[5];
              obj['callclassi'] = row[6];
              obj['calltype'] = row[7];
              obj['callcharge'] = row[8];
              obj['customercode'] = '';
              csvData.push(obj);
              csvstream.resume();
            })
            .on('end', function () {
              csvData.shift();
              const res = insertByBatches(csvData, 'RAWCDR', billingYear, billingMonth);
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
    if (type === 'contents') {
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetContents, tableNameContents);
    } else if (type === 'infini') {
      let tableNameInfini = { table: `byokakin_kddi_infinidata_${billingYear}${billingMonth}` };
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetInfini, tableNameInfini);
    } else if (type === 'RAWCDR') {

      let tableNameKDDIRAW = { table: `byokakin_kddi_raw_cdr_${billingYear}${billingMonth}` };
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetKDDIRAW, tableNameKDDIRAW);

    } else if (type == 'kddi_kotehi_bill_detail') {
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSetKDDIBillDetail, tableNameKDDIBillDetail);
    }
    else {
      res = await db.queryBatchInsertByokakin(chunkArray[i], ColumnSet, tableName);
    }
  }
  resArr.push(res);
  console.log("done" + new Date());
  console.log(resArr);
  return resArr;

}

async function inserBulkData(data) {
  try {
    const res = await db.queryBatchInsertByokakin(data, ColumnSetKDDIRAW, tableNameKDDIRAW);

    console.log("rsult is .." + res)

  } catch (error) {
    console.log("error" + error.message);
  }


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




