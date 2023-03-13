var db = require('./../../config/database');
const { BATCH_SIZE } = require('../../config/config');
const CDR_MVNO_CS = 'cdr_mvno_cs';
const CDR_MVNO_FPHONE_CS = 'cdr_mvno_fphone_cs';

module.exports = {

  getTargetDate: async function (date_id) {
    try {
      const query = `SELECT date_id , date_set::date + interval '1' day as next_run_time  ,  (date_set)::date + interval '0 HOURS' as target_date , (date_set)::date - interval '9 HOURS'  as target_date_with_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
      const targetDateRes = await db.query(query, []);
      //console.log(targetDateRes);
      if (targetDateRes.rows) {
        return { 'id': (targetDateRes.rows[0].date_id), 'next_run_time': (targetDateRes.rows[0].next_run_time), 'targetDate': (targetDateRes.rows[0].target_date), 'targetDateWithTimezone': (targetDateRes.rows[0].target_date_with_timezone) };
      }
      return { err: 'not found' };
    } catch (error) {
      return error;
    }
  },
  getMVNOCustomerList: async function () {
    try {
      const query = `select id, customer_name, customer_id, did, service_type, leg  from mvno_customer where deleted = false order by customer_name,leg`;
      const mvnoCustList = await db.queryIBS(query, []);
      //console.log(targetDateRes);
      if (mvnoCustList.rows) {
        return mvnoCustList.rows;
      }
      return { err: 'not found' };
    } catch (error) {
      return error;
    }
  },
  getRates: async function (customerId, customerName) {
    try {
      let where = "";

      if (customerId) {
        where = `WHERE customer_id= '${customerId}' `;
      }
      const query = `select customer_id, landline, mobile from mvno_rates ${where} `;
      const ratesRes = await db.query(query, [], ipsPortal = true);

      if (ratesRes.rows) {
        return (ratesRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      return error;
    }
  },
  getFPhoneRates: async function () {
    try {

      const query = `select * from cdr_fphone_rate `;
      const ratesRes = await db.queryIBS(query, []);

      if (ratesRes.rows) {
        return (ratesRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      return error;
    }
  },
  getFPhoneCarrierChage: async function () {
    try {

      const query = `select * from cdr_fphone_carrier_change `;
      const ratesRes = await db.queryIBS(query, []);

      if (ratesRes.rows) {
        return (ratesRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      return error;
    }
  },
  getFPhoneRelayCarrier: async function () {
    try {

      const query = `select * from cdr_fphone_relay_carrier`;
      const ratesRes = await db.queryIBS(query, []);

      if (ratesRes.rows) {
        return (ratesRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      return error;
    }
  },
  getFPhoneTermUse: async function () {
    try {

      const query = `select * from carrier`;
      const ratesRes = await db.queryIBS(query, []);

      if (ratesRes.rows) {
        return (ratesRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      return error;
    }
  },
  deleteTargetDateCDR: async function (targetDateWithTimezone, customerId, customerName) {
    try {
      let ANDclo = "";


      const query = `delete FROM calltemp_excel2 where STARTTIME BETWEEN '${targetDateWithTimezone}' and 
        DATEADD(day, 1, '${targetDateWithTimezone}') `;
      const deleteTargetDateRes = await db.queryIBS(query, []);
      return deleteTargetDateRes;
    } catch (error) {
      console.log("Err " + error.message);
      return error;
    }
  },
  getTargetCDR: async function (targetDateWithTimezone, customerInfo, trunkPortsVal, type) {
    try {

      const query = `SELECT callid ,  addchargecode ,  altbillingcallcharge ,  altbillingrateplanid ,    altbillingratingerrorcode ,   unused189f ,
        authcode ,  billableseconds ,  billdate ,  billedseconds ,  billedsecondsdisplay ,  billingclass ,   callcharge ,  calldirection ,  
        callstatuscode ,  calltypecode ,  connectseconds ,  custaccountcode ,   custcode ,  custid ,  custserviceid ,  discountamount , 
        dnis ,  origani , termani , outportgroupnumber , termcountrydesc , stoptime ,   starttime , inseizetime 
        FROM CALL WITH(NOLOCK) WHERE starttime BETWEEN '${targetDateWithTimezone}' and  DATEADD(day, 28, '${targetDateWithTimezone}') AND 
        (calldirection = 'O') AND (connectseconds > 0) ORDER BY starttime `;
      //console.log("query="+query);
      const data = await db.msSQLServer(query);

      // console.log(JSON.stringify(data.recordset))

      return data.recordset;
    } catch (error) {
      console.log("err=" + error.message);
      return error;
    }

  },

  insertByBatches: async function (records) {

    const JSON_data = Object.values(JSON.parse(JSON.stringify(records)));
    //st dataSize=JSON_data.length;
    const chunkArray = await chunk(JSON_data, BATCH_SIZE);
    // console.log(JSON.stringify(chunkArray));
    //console.log(JSON.stringify(customerInfo));
    let res = [];
    let resArr = [];
    for (let i = 0; i < chunkArray.length; i++) {
      const data = await getNextInsertBatch(chunkArray[i]);
      //console.log("data="+JSON.stringify(data));
      res = await db.queryBatchInsertWithoutColumnSet(data, CDR_MVNO_CS);
      resArr.push(res);
    }
    console.log("done" + new Date());
    console.log(resArr);
    return resArr;

  },

  deleteTargetDateCDRFPhone: async function (targetDate, leg, company_code) {
    try {

      const query = `delete FROM cdr_fphone where start_time::date = '${targetDate}'::date + interval '1' day  and company_code='${company_code}' and leg='${leg}'`;
      const deleteTargetDateRes = await db.queryIBS(query, []);
      return deleteTargetDateRes;
    } catch (error) {
      console.log("Err " + error.message);
      return error;
    }
  },
  getTargetCDRFPhone: async function (targetDateWithTimezone, leg, company_code) {
    try {

      let where = "";
      if (leg == 'A') {
        where = `WHERE STARTTIME >= '${targetDateWithTimezone}' and startTime < DATE_ADD("${targetDateWithTimezone}", INTERVAL 1 DAY)  
        AND (GW IN ('NFPGSX4','IPSGSX5')) 
        AND (CALLDURATION > 0)
        AND RECORDTYPEID = 3 
        AND ((INCALLEDNUMBER like '00322223%') OR (INCALLEDNUMBER like '00322224%') OR (INCALLEDNUMBER like '00322225%'))
        order by STARTTIME asc `;
      } else {
        where = `WHERE STARTTIME >= '${targetDateWithTimezone}' and startTime < DATE_ADD("${targetDateWithTimezone}", INTERVAL 1 DAY)  
        AND (GW IN ('NFPGSX4','IPSGSX5')) 
        AND (CALLDURATION > 0)
        AND RECORDTYPEID = 3 
        AND (INGRPSTNTRUNKNAME='IPSSONW5Z3PRII')
        order by STARTTIME asc `;
      }

      const query = `SELECT GW, SESSIONID, CALLDURATION, STARTTIME, ADDTIME(STARTTIME,'09:00:00') AS BEGINTIME, DISCONNECTTIME, ADDTIME(DISCONNECTTIME,'09:00:00') AS STOPTIME,
      TRUNCATE(CALLDURATION*0.01 +  0.9,  0) AS DURATION, INANI, INGRPSTNTRUNKNAME,
      OUTGOING, INCALLEDNUMBER, CALLINGPARTYCATEGORY, EGCALLEDNUMBER, INGRESSPROTOCOLVARIANT,CALLSTATUS FROM COLLECTOR_73 ${where}`;


      //console.log("query="+query);
      const data = await db.mySQLQuery(query);

      // console.log(JSON.stringify(data.recordset))

      return data;
    } catch (error) {
      console.log("err=" + error.message);
      return error;
    }

  },

  deleteTargetDateCDRFPhoneXMOBILE: async function (targetDate, leg, company_code) {
    try {

      const query = `delete FROM cdr_fphone where start_time::date = '${targetDate}'::date + interval '1' day and company_code='${company_code}' and leg='${leg}'`;
      const deleteTargetDateRes = await db.queryIBS(query, []);
      return deleteTargetDateRes;
    } catch (error) {
      console.log("Err " + error.message);
      return error;
    }
  },
  getTargetCDRFPhoneXMOBILE: async function (targetDateWithTimezone, leg, company_code) {
    try {

      let where = "";
      if (leg == 'A') {
        where = `WHERE STARTTIME >= '${targetDateWithTimezone}' and startTime < DATE_ADD("${targetDateWithTimezone}", INTERVAL 1 DAY)  
        AND (GW IN ('NFPGSX4','IPSGSX5')) 
        AND (CALLDURATION > 0)
        AND RECORDTYPEID = 3 
        AND ((EGCALLEDNUMBER LIKE '%33328222%'))
        order by STARTTIME asc `;
      } else {
        where = `WHERE STARTTIME >= '${targetDateWithTimezone}' and startTime < DATE_ADD("${targetDateWithTimezone}", INTERVAL 1 DAY)  
        AND (GW IN ('NFPGSX4','IPSGSX5')) 
        AND (CALLDURATION > 0)
        AND RECORDTYPEID = 3 
        AND (INGRPSTNTRUNKNAME='IPSXMO50EGPRII')
        order by STARTTIME asc `;
      }

      const query = `SELECT GW, SESSIONID, CALLDURATION, STARTTIME, ADDTIME(STARTTIME,'09:00:00') AS BEGINTIME, DISCONNECTTIME, ADDTIME(DISCONNECTTIME,'09:00:00') AS STOPTIME,
      TRUNCATE(CALLDURATION*0.01 +  0.9,  0) AS DURATION, INANI, INGRPSTNTRUNKNAME,
      OUTGOING, INCALLEDNUMBER, CALLINGPARTYCATEGORY, EGCALLEDNUMBER, INGRESSPROTOCOLVARIANT,CALLSTATUS FROM COLLECTOR_73 ${where}`;


      //console.log("query="+query);
      const data = await db.mySQLQuery(query);

      // console.log(JSON.stringify(data.recordset))

      return data;
    } catch (error) {
      console.log("err=" + error.message);
      return error;
    }

  },

  insertByBatchesFPhone: async function (records, leg, ratesInfo, getFPhoneCarrierChageRes, getFPhoneRelayCarrierRes, getFPhoneTermUse,company_code) {
 
    const JSON_data = Object.values(JSON.parse(JSON.stringify(records)));
    const chunkArray = await chunk(JSON_data, BATCH_SIZE);
    let res = [];
    let resArr = [];
    for (let i = 0; i < chunkArray.length; i++) {
      const data = await getNextInsertBatchFphone(chunkArray[i], leg, ratesInfo, getFPhoneCarrierChageRes, getFPhoneRelayCarrierRes, getFPhoneTermUse,company_code);
      res = await db.queryBatchInsertWithoutColumnSet(data, CDR_MVNO_FPHONE_CS);
      resArr.push(res);
    }
    console.log("done" + new Date());
    console.log(resArr);
    return resArr;

  },


  updateBatchControl: async function (serviceId, targetDate, api) {
    let query;
    try {
      if (api) {
        query = `update batch_date_control set date_set='${targetDate}'::date + interval '0' day , last_update=now() where date_id='${serviceId}'`;
      } else {
        query = `update batch_date_control set date_set='${targetDate}'::date + interval '1' day , last_update=now() where date_id='${serviceId}'`;
      }

      const updateBatchControlRes = await db.query(query, []);
      return updateBatchControlRes;
    } catch (error) {
      return error;
    }
  },
  deleteTargetDateSummary: async function (serviceId, targetDate) {
    try {
      const query = `delete FROM sonus_outbound_summary where summary_date::date = '${targetDate}'::date + interval '1' day and service_id='${serviceId}'`;
      const deleteTargetDateSummaryRes = await db.query(query, []);
      return deleteTargetDateSummaryRes;
    } catch (error) {
      console.log("Err " + error.message);
      return error;
    }
  },



  getProSummaryData: async function (targetDate) {
    try {
      const query = `select sum(duration_use), round(sum(mob_amount)) as mob_amount , round(sum(landline_amount)) as landline_amount, billing_comp_name  from cdr_sonus_outbound where start_time >='2021-02-01 00:00:00' and start_time <='2021-02-28 23:59:59' group by billing_comp_name`;
      const getProSummaryDataRes = await db.query(query, []);
      return getProSummaryDataRes.rows;
    } catch (error) {
      console.log("Err " + error.message);
      return error;
    }
  },

}

async function getCarrierTranFlag(data, carrier_id) {
  let TERMFLAG = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i]['carrier_id'] == carrier_id) {
      TERMFLAG = 1;
      break;
    }
  }
  return TERMFLAG;
}

async function getCarrierChangeFlag(data, carrier_from) {
  let TERMFLAG = 0;

  for (let i = 0; i < data.length; i++) {
    if (data[i]['carrier_from'] == carrier_from) {
      TERMFLAG = 1;
      break;
    }
  }
  return TERMFLAG;
}

async function getCarrierChangeToFlag(data, carrier_from) {
  let carrierTo = '';

  for (let i = 0; i < data.length; i++) {
    if (data[i]['carrier_from'] == carrier_from) {
      carrierTo = data[i]['carrier_to'];
      break;
    }
  }
  return carrierTo;
}

async function getActualCarrierCode(XFC, XFE, getFPhoneCarrierChageRes, getFPhoneRelayCarrierRes) {
  let TERMFLAG = 0, TERMIDSET = '';

  //console.log("XFC=" + XFC);

  TERMFLAG = await getCarrierChangeFlag(getFPhoneCarrierChageRes, XFC);

  //console.log("TERMFLAG=="+TERMFLAG);

  if (TERMFLAG == 0) {

    TERMIDSET = XFC;

  } else if (TERMFLAG == 1) {

    //console.log("1----");

    let transit_carrier_id_arr = XFE.split(":");
    let countTransitCarrierIds = transit_carrier_id_arr.length;
    let TRANFLAG = 0;


    //console.log("length----"+countTransitCarrierIds);

    if (countTransitCarrierIds > 0) {

      for (let j = 0; j < countTransitCarrierIds; j++) {
        TRANFLAG = TRANFLAG + await getCarrierTranFlag(getFPhoneRelayCarrierRes, transit_carrier_id_arr[j]);
      }

    } else {
      TRANFLAG = await getCarrierTranFlag(getFPhoneRelayCarrierRes, XFE);
    }


    //console.log("TRANFLAG=="+TRANFLAG);
    

    if (TRANFLAG > 0) {
      TERMIDSET = await getCarrierChangeToFlag(getFPhoneCarrierChageRes, XFC);
    } else {
      TERMIDSET = XFC;
    }
  }
  //console.log("TERMIDSET=" + TERMIDSET);

  return TERMIDSET;
}

async function getMVNORates(data, carrier_id, leg, carrierCode) {
  let res = {};

  //console.log("comp code=="+carrier_id);
  //console.log("data=="+data.length);

  try {
    if (leg == 'A') {
      for (let i = 0; i < data.length; i++) {
        if (data[i]['carrier_id'] == carrier_id) {

          res['term_use'] = data[i]['carrier_terminal'];
          res['setup_rate'] = data[i]['aleg_setup'];
          res['call_rate'] = data[i]['aleg_rate'];
          res['carrier_name'] = data[i]['carrier_name'];
          break;
        }
      }
    } else if (leg == 'B') {
      for (let i = 0; i < data.length; i++) {
        if (data[i]['carrier_id'] == carrierCode) {

          res['term_use'] = data[i]['carrier_terminal'];
          res['setup_rate'] = data[i]['bleg_setup'];
          res['call_rate'] = data[i]['bleg_rate'];
          res['carrier_name'] = data[i]['carrier_name'];
          break;
        }
      }
    }

  } catch (err) {
    console.log("error in get rates");
  }

  return res;
}

async function getNextInsertBatchFphone(data, leg, ratesInfo, getFPhoneCarrierChageRes, getFPhoneRelayCarrierRes, getFPhoneTermUse, company_code) {

  let valueArray = [];
  let freqRate = 0.05;
  console.log("inserting data")

  try {
    for (let i = 0; i < data.length; i++) {

      let obj = {};
      const { XFB, XFC, XFD, XFE } = await getInOutbound(data[i]['INGRESSPROTOCOLVARIANT'], data[i]['INGRPSTNTRUNKNAME']);
      let carrierCode = '';
      if (leg == 'B') {

        carrierCode = await getActualCarrierCode(XFC, XFE, getFPhoneCarrierChageRes, getFPhoneRelayCarrierRes, getFPhoneTermUse);
        freqRate = 0;
      } else {
        freqRate = 0.05;
      }


      const rateInfo = await getMVNORates(ratesInfo, XFB, leg, carrierCode);

      let duration = Math.ceil(parseFloat(data[i]['DURATION']));

      obj['stop_time'] = data[i]['STOPTIME'];
      obj['start_time'] = data[i]['BEGINTIME'];
      obj['orig_ani'] = data[i]['INANI'];
      obj['term_ani'] = data[i]['INCALLEDNUMBER'];
      obj['duration'] = duration;
      obj['orig_carrier_id'] = XFB;
      obj['term_carrier_id'] = XFC;
      obj['transit_carrier_id'] = XFE;
      obj['selected_carrier_id'] = XFD;
      obj['sonus_session_id'] = data[i]['SESSIONID'];
      obj['sonus_start_time'] = data[i]['STARTTIME'];
      obj['sonus_disconnect_time'] = data[i]['DISCONNECTTIME'];
      obj['sonus_call_duration_second'] = parseInt(data[i]['DURATION'], 10);
      obj['sonus_anani'] = data[i]['INANI'];
      obj['sonus_incallednumber'] = data[i]['INCALLEDNUMBER'];
      obj['sonus_ingressprotocolvariant'] = data[i]['INGRESSPROTOCOLVARIANT'];
      obj['sonus_ingrpstntrunkname'] = data[i]['INGRPSTNTRUNKNAME'];
      obj['gw'] = data[i]['GW'];
      obj['callstatus'] = data[i]['CALLSTATUS'];

      obj['leg'] = leg;
      obj['setup_rate'] = rateInfo['setup_rate'];
      obj['call_rate'] = rateInfo['call_rate'];
      obj['call_charge'] = parseFloat(duration * rateInfo['call_rate']) + parseFloat(rateInfo['setup_rate']) + parseFloat(duration * freqRate);
      obj['term_use'] = rateInfo['term_use'];
      obj['carrier_name'] = rateInfo['carrier_name'];
      if(leg == 'B'){
        obj['bleg_term_id'] = carrierCode ;
      }else{
        obj['bleg_term_id'] = XFB;
      }
      obj['company_code'] = company_code;
      obj['freq_rate'] = freqRate;

      valueArray.push(obj);

    }
  } catch (err) {
    console.log("err" + err.message);
  }

  return valueArray;
}

async function getNextInsertBatch(data) {

  let valueArray = [];
 
  console.log("inserting data")

  try {
    for (let i = 0; i < data.length; i++) {

      let obj = {};
      // const { XFB, XFC, XFD, XFE } = await getInOutbound(data[i]['INGRESSPROTOCOLVARIANT'], data[i]['INGRPSTNTRUNKNAME']);
      // let carrierCode = '';
      
      // const rateInfo = await getMVNORates(ratesInfo, XFB, carrierCode);

      // let duration = Math.ceil(parseFloat(data[i]['DURATION']));

      obj['callid'] = data[i]['callid'];
      obj['addchargecode'] = data[i]['addchargecode'];
      obj['altbillingcallcharge'] = data[i]['altbillingcallcharge'];
      obj['altbillingrateplanid'] = data[i]['altbillingrateplanid'];      
      obj['altbillingratingerrorcode'] = data[i]['altbillingratingerrorcode'];
      obj['unused189f'] = data[i]['unused189f'];;
      obj['authcode'] = data[i]['authcode'];;
      obj['billableseconds'] = data[i]['billableseconds'];;
      obj['billdate'] = data[i]['billdate'];;
      obj['billedseconds'] = data[i]['billedseconds'];;
      obj['billedsecondsdisplay'] = data[i]['billedsecondsdisplay'];
      obj['billingclass'] = data[i]['billingclass'];
      obj['callcharge'] = data[i]['callcharge'];
      obj['calldirection'] =data[i]['calldirection'];
      obj['callstatuscode'] = data[i]['callstatuscode'];
      obj['calltypecode'] = data[i]['calltypecode'];
      obj['connectseconds'] = data[i]['connectseconds'];
      obj['custaccountcode'] = data[i]['custaccountcode'];
      obj['custcode'] = data[i]['custcode'];
      obj['custid'] = data[i]['custid'];
      obj['custserviceid'] = data[i]['custserviceid'];;
      obj['discountamount'] = data[i]['discountamount'];;
      obj['dnis'] = data[i]['dnis'];;
      obj['origani'] = data[i]['origani'];;
      obj['termani'] = data[i]['termani'];;
      obj['outportgroupnumber'] = data[i]['outportgroupnumber'];;
      obj['termcountrydesc'] = data[i]['termcountrydesc'];;
      obj['stoptime'] = data[i]['stoptime'];;
      obj['starttime'] = data[i]['starttime']; ;
      obj['inseizetime'] = data[i]['inseizetime'];;
      
      valueArray.push(obj);

    }
  } catch (err) {
    console.log("err" + err.message);
  }

  return valueArray;
}


async function chunk(array, size) {

  console.log("chunk" + size);

  const chunked_arr = [];
  let copied = [...array]; // ES6 destructuring
  const numOfChild = Math.ceil(copied.length / size); // Round up to the nearest integer
  for (let i = 0; i < numOfChild; i++) {
    chunked_arr.push(copied.splice(0, size));
  }
  return chunked_arr;
}


async function getInOutbound(INGRESSPROTOCOLVARIANT, INGRPSTNTRUNKNAME) {
  //"JAPAN,0,0,,,,,,,,,32000,,,1,0,,,,,,,,1,,,0xfc,5039,,,,,,,,,,,,,,,,,,,,,,,,,,,,32000,0x03,,,,2,0,,,0,,,0x3
  //,,,,,,,,,,,,,,,,,,,,,,,,,,,,,3,0,0,,,,0,1,,,4,,,,,,,,,,,,,,,0,0,,,32000,32000,,,,,,1-1,1-0,,,,,,,,,,,,,,,,,
  //,,,,,,,1,0xfe,2233,32000,0x22,1,0xfe,2013,47600,,1,0xfb,2030,,,,,,,,,,"
  let XFB = "", XFC = "", XFD = "", XFE = "", XFEF = "", XFEL = "", INOU = 0, INDO = 0, XFEC = 0, TRUNKPORT = 0;

  //return { TRUNKPORT, XFB, XFC, XFD, XFE, XFEF, XFEL, INOU, INDO, XFEC };


  if (INGRESSPROTOCOLVARIANT) {
    //XFB
    let XFBIndex = INGRESSPROTOCOLVARIANT.indexOf("0xfb");

    // console.log("XFBIndex=" + XFBIndex);

    if (XFBIndex != -1) {
      XFB = INGRESSPROTOCOLVARIANT.substring(XFBIndex + 5, XFBIndex + 9);
    }
    //XFC
    let XFCIndex = INGRESSPROTOCOLVARIANT.indexOf("0xfc");
    if (XFCIndex != -1) {
      XFC = INGRESSPROTOCOLVARIANT.substring(XFCIndex + 5, XFCIndex + 9);
    }
    //XFD
    let XFDIndex = INGRESSPROTOCOLVARIANT.indexOf("0xfd");
    if (XFDIndex != -1) {
      XFD = INGRESSPROTOCOLVARIANT.substring(XFDIndex + 5, XFDIndex + 9);
    }

    //1個目の0XFEデータがあるかどうかを確認, 0xfe
    let XFEIndex = INGRESSPROTOCOLVARIANT.indexOf("0xfe");
    //console.log("XFEIndex=" + XFEIndex);

    if (XFEIndex != -1) {
      XFE = INGRESSPROTOCOLVARIANT.substring(XFEIndex + 5, XFEIndex + 9);
      //set the first carrier id
      XFEF = INGRESSPROTOCOLVARIANT.substring(XFEIndex + 5, XFEIndex + 9);
      // set the last carrier id
      XFEL = INGRESSPROTOCOLVARIANT.substring(XFEIndex + 5, XFEIndex + 9);

      //Check if there is a second 0XFE data

      let XFEIndex1 = INGRESSPROTOCOLVARIANT.indexOf("0xfe", XFEIndex + 5);

      // console.log("XFEIndex1=" + XFEIndex1);

      if (XFEIndex1 != -1) {

        XFE = XFE + ':' + INGRESSPROTOCOLVARIANT.substring(XFEIndex1 + 5, XFEIndex1 + 9);
        // set the last carrier id
        XFEL = INGRESSPROTOCOLVARIANT.substring(XFEIndex1 + 5, XFEIndex1 + 9);

        //Check if there is a third 0XFE data

        let XFEIndex2 = INGRESSPROTOCOLVARIANT.indexOf("0xfe", XFEIndex1 + 5);
        // console.log("XFEIndex2=" + XFEIndex2);

        if (XFEIndex2 != -1) {

          XFE = XFE + ':' + INGRESSPROTOCOLVARIANT.substring(XFEIndex2 + 5, XFEIndex2 + 9);
          // set the last carrier id
          XFEL = INGRESSPROTOCOLVARIANT.substring(XFEIndex2 + 5, XFEIndex2 + 9);

          //Check if there is a fourth 0XFE data

          let XFEIndex3 = INGRESSPROTOCOLVARIANT.indexOf("0xfe", XFEIndex2 + 5);
          if (XFEIndex3 != -1) {

            XFE = XFE + ':' + INGRESSPROTOCOLVARIANT.substring(XFEIndex3 + 5, XFEIndex3 + 9);
            // set the last carrier id
            XFEL = INGRESSPROTOCOLVARIANT.substring(XFEIndex3 + 5, XFEIndex3 + 9);

            //Check if there is a fifth 0XFE data

            let XFEIndex4 = INGRESSPROTOCOLVARIANT.indexOf("0xfe", XFEIndex3 + 5);
            if (XFEIndex4 != -1) {

              XFE = XFE + ':' + INGRESSPROTOCOLVARIANT.substring(XFEIndex4 + 5, XFEIndex4 + 9);
              // set the last carrier id
              XFEL = INGRESSPROTOCOLVARIANT.substring(XFEIndex4 + 5, XFEIndex4 + 9);

            }
          }
        }
      }

    }

  }

  return { XFB, XFC, XFD, XFE }

}
