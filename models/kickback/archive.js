var db = require('./../../config/database');
const { BATCH_SIZE } = require('../../config/config');
const CDR_CS = 'cdr_cs';
const BILLCDR_CS = 'billcdr_cs';

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
  getTableName: async function (targetDate) {
    try {
      const year = new Date(targetDate).getFullYear();
      let month = new Date(targetDate).getMonth() + 1;

      if (parseInt(month, 10) < 10) {
        month = '0' + month;
      }
      return `cdr_${year}${month}`;

    } catch (e) {
      console.log("err in get table=" + e.message);
      return console.error(e);
    }
  },
  deleteTargetDateCDR: async function (targetDate, tableName) {
    try {
      const query = `delete FROM ${tableName} where START_TIME::date = '${targetDate}'::date`;
      const deleteTargetDateRes = await db.query(query, []);
      return deleteTargetDateRes;
    } catch (error) {
      return error;
    }
  },
  getTargetCDR: async function (targetDateWithTimezone) {

    try {
      const query = `SELECT GW, SESSIONID, STARTTIME, CALLDURATION, ADDTIME(STARTTIME,'09:00:00') AS ORIGDATE, DISCONNECTTIME, ADDTIME(DISCONNECTTIME,'09:00:00') AS STOPTIME, 
        CALLDURATION*0.01 AS DURATION, CEIL(CALLDURATION*0.01) AS DURATIONKIRIAGE, INANI, INGRPSTNTRUNKNAME,
        OUTGOING, INCALLEDNUMBER, CALLINGPARTYCATEGORY, EGCALLEDNUMBER, INGRESSPROTOCOLVARIANT,CALLSTATUS FROM COLLECTOR_73  
        where STARTTIME >= '${targetDateWithTimezone}' and startTime < DATE_ADD("${targetDateWithTimezone}", INTERVAL 1 DAY)  
        AND (GW IN ('NFPGSX4','IPSGSX5')) 
        AND (CALLDURATION > 0)
        AND RECORDTYPEID = 3 
        AND (INGRPSTNTRUNKNAME IN ('IPSFUS10NWJ','IPSKRG5A00J','IPSKRG6BIIJ','IPSSHGF59EJ','IPSSHG5423J7') )
        order by STARTTIME asc ` ;

      const data = await db.mySQLQuery(query,[],'kickback');
      return data;
    } catch (error) {
      return error;
    }
  },
  deleteTargetBillableCDR: async function (targetDate, tableName) {
    try {
      const query = `delete FROM billcdr_main where START_TIME::date = '${targetDate}'::date`;
      const deleteTargetDateRes = await db.queryIBS(query, []);
      return deleteTargetDateRes;
    } catch (error) {
      return error;
    }
  },
  getTargetBillableCDR: async function (targetDate, tableName) {
    try {
      const query = `SELECT * from ${tableName} where (SONUS_GW IN ('nfpgsx4','IPSGSX5'))  AND ((TERM_ANI ILIKE '035050%')
       OR (TERM_ANI ILIKE '35050%') OR (TERM_ANI ILIKE '036110%') OR (TERM_ANI ILIKE '36110%') OR (TERM_ANI ILIKE '050505%')
        OR (TERM_ANI ILIKE '50505%')) and start_time::date='${targetDate}'::date   `;

   //     console.log("query="+query);

      const targetDateRes = await db.query(query, []);

      return targetDateRes.rows;
      // console.log(targetDateRes);

    } catch (error) {
      console.log("error in get target billable cdr=" + error.message);
      return error;
    }
  },


  insertByBatches: async function (records, getCompanyCodeInfoRes, getRemoteControlNumberDataRes, carrierInfo, companyInfo, __type) {
  //  console.log("total records="+records.length);

    const chunkArray = chunk(records, BATCH_SIZE);
    let res = [];
    let resArr = [];

    for (let i = 0; i < chunkArray.length; i++) {
      if (__type == 'raw_cdr') {
        const data = await getNextInsertBatch(chunkArray[i], getCompanyCodeInfoRes, getRemoteControlNumberDataRes);
        res = await db.queryBatchInsert(data, CDR_CS);
      } else if (__type == 'bill_cdr') {
        const data = await getNextInsertBatchBillCDR(chunkArray[i], carrierInfo, companyInfo);
        res = await db.queryBatchInsert(data, BILLCDR_CS);
      }

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
      return error;
    }
  },
  getProSummaryData: async function (targetDate) {
    try {
      const query = `select count(*) as total FROM cdr_sonus where START_TIME >= '${targetDate}' and start_Time < '${targetDate}'::timestamp + INTERVAL '1' DAY`;
      const getProSummaryDataRes = await db.query(query, []);
      return getProSummaryDataRes.rows;
    } catch (error) {
      return error;
    }
  },
  getStatus: async function (targetDate) {
    try {
      const query = `select count(*) as total FROM cdr_sonus where START_TIME >= '${targetDate}' and start_Time < '${targetDate}'::timestamp + INTERVAL '1' DAY`;
      const getProSummaryDataRes = await db.query(query, []);
      return getProSummaryDataRes.rows;
    } catch (error) {
      return error;
    }
  },
  updateSummaryData: async function (serviceId, targetDateWithTimezone, sonusData, billingServerData) {

    try {

      const query = `insert into sonus_outbound_summary (service_id, raw_cdr_cound, pro_cdr_count, summary_date, date_updated) 
        VALUES ($1, $2, $3, $4, $5) returning cdr_id`;

      let valueArray = [];
      valueArray.push(serviceId);
      valueArray.push(parseInt(sonusData.length));
      valueArray.push(parseInt(billingServerData[0]['total']));
      valueArray.push(targetDateWithTimezone);
      valueArray.push(now());

      const updateSummaryDataRes = await db.query(query, valueArray);
      return updateSummaryDataRes;
    } catch (error) {
      return error;
    }
  },
  getRemoteControlNumberData: async function (DATSTARTTIME) {
    try {
      const query = `select company_code, tel_no from remote_control_number  where DATE_EXPIRED >= '${DATSTARTTIME}' `;
      const getRemoteControlNumberRes = await db.queryIBS(query, []);
      return getRemoteControlNumberRes.rows;
    } catch (error) {
      console.log("error in get remote control number info query" + error.message);
      return error;
    }
  },

  getCompanyCodeInfo: async function (DATSTARTTIME) {
    try {
      const query = `select * from route where DATE_EXPIRED >= '${DATSTARTTIME}' `;
      const getCompanyCodeInfoRes = await db.queryIBS(query, []);
      if (getCompanyCodeInfoRes.rows) {
        return getCompanyCodeInfoRes.rows;
      }

    } catch (error) {
      console.log("error in get company info query" + error.message);
      return error;
    }
  },
  getKickCompanyInfo: async function () {
    try {
      const query = `select substring(_03_numbers, 2, 10) as _03_numbers, customer_cd from _03numbers  `;
      const getKickCompanyInfoRes = await db.queryIBS(query, []);
      if (getKickCompanyInfoRes.rows) {
        return getKickCompanyInfoRes.rows;
      }
    } catch (error) {
      console.log("error in get company info query" + error.message);
      return error;
    }
  },
  getTerminalUseInfo: async function (DATSTARTTIME) {
    try {
      const query = `select carrier_code, term_use from carrier `;
      const getTerminalUseInfoRes = await db.queryIBS(query, []);
      if (getTerminalUseInfoRes.rows) {
        return getTerminalUseInfoRes.rows;
      }


    } catch (error) {
      console.log("error in get terminal use info query" + error.message);
      return error;
    }
  }

}

function utcToDate(utcDate) {
  let newDate = '';
  let stDate = utcDate.toISOString();

  try {
    newDate = stDate.replace(/T/, ' ').replace(/\..+/, '');
  } catch (err) {
    console.log(err.message);
    newDate = stDate;
  }
  return newDate;
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return utcToDate(result);
}


async function getCompanyCode(STRXFB, STRXFC, STRXFD, STRXFE, DATSTARTTIME, STRTELCALL, getCompanyCodeInfoRes, getRemoteControlNumberDataRes) {
  let companyCode = "9999999999";

  let companyCodeInfoArr = getCompanyCodeInfoRes;
  // console.log("companyCodeInfoArr="+JSON.stringify(companyCodeInfoArr));
  try {
    for (let i = 0; i < companyCodeInfoArr.length; i++) {

      if (companyCodeInfoArr[i]['carrier_code'] == STRXFB && (companyCodeInfoArr[i]['relay_code'] == '')) {

        //  console.log("carr"+companyCodeInfoArr[i]['carrier_code']);
        //   console.log("STRXFB="+STRXFB);
        //  console.log("pattern="+companyCodeInfoArr[i]['pattern']);
        //  console.log("STRXFD="+STRXFD);


        if (companyCodeInfoArr[i]['pattern'] == '1') {
          // console.log("pattern="+companyCodeInfoArr[i]['pattern']);
          return companyCodeInfoArr[i]['company_code1'].replace(" ", "");
        } else if (companyCodeInfoArr[i]['pattern'] == '2') {
          //          console.log("aa"+STRXFD.length);

          if (STRXFD == '' || STRXFD == null) {
            //          console.log("if");
            return companyCodeInfoArr[i]['company_code1'].replace(" ", "");
          } else {
            //        console.log("else");
            return await getCompanyCodeOnRelayCode(companyCodeInfoArr, STRXFD, STRXFB, companyCodeInfoArr[i]['pattern'], companyCodeInfoArr[i]['company_code1']);

          }
        } else if (companyCodeInfoArr[i]['pattern'] == '3') {
          return await getCompanyCodeOnRelayCode(companyCodeInfoArr, STRXFD, STRXFB, companyCodeInfoArr[i]['pattern'], companyCodeInfoArr[i]['company_code1']);

        } else if (companyCodeInfoArr[i]['pattern'] == '4') {

          for (let i = 0; i < getRemoteControlNumberDataRes.length; i++) {

            if (getRemoteControlNumberDataRes[i]['tel_no'] == STRTELCALL) {
              return getRemoteControlNumberDataRes[i]['company_code'].replace(" ", "");
            }
          }
          return "PATTERN4NG"

        }

      }
    }
  } catch (err) {
    console.log("error in get company code=" + err.message);
  }

  return companyCode;
}

async function getCompanyCodeOnRelayCode(data, relayCode, carrierCode, pattern, company_code1) {
  try {
    if (pattern == '2') {
      for (let i = 0; data.length; i++) {
        if (data[i]['carrier_code'] === carrierCode && data[i]['relay_code'] === relayCode) {
          return data[i]['company_code1'].replace(" ", "");
        }
      }
      return "PATTERN2NG";

    } else if (pattern == '3') {
      // console.log("in pattern 3"+relayCode, carrierCode);
      for (let i = 0; data.length; i++) {
        if (data[i]['carrier_code'] == carrierCode && data[i]['relay_code'] == relayCode) {
          for (let j = 0; j < data.length; j++) {
            if (data[j]['carrier_code'] == carrierCode && data[j]['relay_carrier'] == relayCode) {

              //       console.log("testing");
              if (data[j]['company_code2'] == '' || data[j]['company_code2'] == null || data[j]['company_code2'] == undefined) {
                return company_code1.replace(" ", "");
              } else {
                return data[j]['company_code2'].replace(" ", "");
              }

            } else {
              return data[i]['company_code1'].replace(" ", "");
            }
          }
        }
      }


      for (let i = 0; i < data.length; i++) {
        if (data[i]['carrier_code'] == carrierCode && data[i]['relay_carrier'] == relayCode) {
          if (data[i]['company_code2'] == '' || data[i]['company_code2'] == null || data[i]['company_code2'] == undefined) {
            return company_code1.replace(" ", "");
          } else {
            return data[i]['company_code2'].replace(" ", "");
          }
        } else {
          return company_code1.replace(" ", "");
        }
      }

    }

  } catch (err) {
    console.log("error in get comapny code in side relay function=" + err.message);
  }
  return '9999999999';

}


async function getNextInsertBatch(data, getCompanyCodeInfoRes, getRemoteControlNumberDataRes) {
  const dataLen = data.length;
  console.log("data preapering for ");
 // console.log("getCompanyCodeInfoRes leng="+getCompanyCodeInfoRes.length);
  //console.log("getRemoteControlNumberDataRes=="+getRemoteControlNumberDataRes.length);
  
  
  let valueArray = [];

  try {
    for (let i = 0; i < dataLen; i++) {
      const { TRUNKPORT, XFB, XFC, XFD, XFE, XFEF, XFEL, INOU, INDO, XFEC } = await getInOutbound(data[i]['INGRESSPROTOCOLVARIANT'], data[i]['INGRPSTNTRUNKNAME']);
      const companyCode = await getCompanyCode(XFB, XFC, XFD, XFE, data[i]['ORIGDATE'], data[i]['INCALLEDNUMBER'], getCompanyCodeInfoRes, getRemoteControlNumberDataRes);

      let obj = {};
      obj['date_bill'] = data[i]['ORIGDATE'];
      obj['orig_ani'] = data[i]['INANI'];
      obj['term_ani'] = data[i]['INCALLEDNUMBER'];
      obj['stop_time'] = data[i]['STOPTIME'];
      obj['start_time'] = data[i]['ORIGDATE'];
      obj['duration'] = parseFloat(data[i]['DURATION']);
      obj['duration_use'] =await getDurationUse(data[i]['DURATION']);
      obj['in_outbound'] = INOU;
      obj['dom_int_call'] = INDO;
      obj['orig_carrier_id'] = XFB;
      obj['term_carrier_id'] = XFC;
      obj['transit_carrier_id'] = XFE;
      obj['selected_carrier_id'] = XFD;
      obj['billing_company_code'] = companyCode;
      obj['trunk_port'] = TRUNKPORT;
      obj['sonus_session_id'] = data[i]['SESSIONID'];
      obj['sonus_start_time'] = data[i]['STARTTIME'];
      obj['sonus_disconnect_time'] = data[i]['DISCONNECTTIME'];
      obj['sonus_call_duration'] = data[i]['CALLDURATION'];
      obj['sonus_call_duration_second'] = parseInt(data[i]['DURATION'], 10);
      obj['sonus_anani'] = data[i]['INANI'];
      obj['sonus_incallednumber'] = data[i]['INCALLEDNUMBER'];
      obj['sonus_ingressprotocolvariant'] = data[i]['INGRESSPROTOCOLVARIANT'];
      obj['registerdate'] = 'now()';
      obj['sonus_ingrpstntrunkname'] = data[i]['INGRPSTNTRUNKNAME'];
      obj['sonus_gw'] = data[i]['GW'];
      obj['sonus_callstatus'] = data[i]['CALLSTATUS'];
      obj['sonus_callingnumber'] = data[i]['CALLINGNUMBER'];
      valueArray.push(obj);

    }
  } catch (err) {
    console.log("err in data preapring==" + err.message);
  }

  console.log("arr length="+(valueArray.length));


  return valueArray;

}

async function getNextInsertBatchBillCDR(data, companyInfo,carrierInfo ) {
  console.log("data preapering for bill cdr");
  let valueArray = [];

  try {
    for (let i = 0; i < data.length; i++) {

      let obj = {};
      obj['cdr_id'] = data[i]['cdr_id'];
      obj['date_bill'] = data[i]['date_bill'];
      obj['company_code'] = data[i]['billing_company_code'];
      obj['carrier_code'] = data[i]['orig_carrier_id'];;
      obj['in_outbound'] = data[i]['in_outbound'];;
      obj['call_type'] = data[i]['dom_int_call'];
      obj['trunk_port_target'] = data[i]['trunk_port'];;
      obj['duration'] = data[i]['duration_use'];
      obj['start_time'] = data[i]['start_time'];
      obj['stop_time'] = data[i]['stop_time'];
      obj['orig_ani'] = data[i]['orig_ani'];
      obj['term_ani'] = data[i]['sonus_incallednumber'];
      obj['route_info'] = data[i]['sonus_ingressprotocolvariant'];
      obj['date_update'] = 'now()';
      obj['orig_carrier_id'] = data[i]['orig_carrier_id'];;
      obj['term_carrier_id'] = data[i]['term_carrier_id'];;
      obj['transit_carrier_id'] = data[i]['transit_carrier_id'];;
      obj['selected_carrier_id'] = data[i]['selected_carrier_id'];;
      obj['trunk_port_name'] = data[i]['sonus_ingrpstntrunkname'];
      obj['gw'] = data[i]['sonus_gw'];
      obj['session_id'] = data[i]['sonus_session_id'];
      obj['call_status'] = data[i]['sonus_callstatus'];
      obj['kick_company'] = await getKickCompany(data[i]['sonus_incallednumber'], companyInfo);
      obj['term_use'] = await getTerminalUse(data[i]['orig_carrier_id'], carrierInfo);

      valueArray.push(obj);

    }
  } catch (err) {
    console.log("err" + err.message);
  }

  //console.log("arr="+JSON.stringify(valueArray));


  return valueArray;

}

async function getTerminalUse(strOrigANI, carrierInfo) {
 // console.log("called strOrigANI="+strOrigANI+"\n carrierInfo="+carrierInfo.length);
 
  //console.log("typeof =="+typeof(carrierInfo));

  for (let i = 0; i < carrierInfo.length; i++) {

    //console.log("carrierInfo[i]['carrier_code']==="+carrierInfo[i]['carrier_code']);
    //console.log((carrierInfo[i]));
    if (carrierInfo[i]['carrier_code'] == strOrigANI) {
      //console.log("term_usee"+carrierInfo[i]['term_use']);
      return carrierInfo[i]['term_use'];
    }
  }
  return '0'
}

async function getKickCompany(calledNumber, companyInfo) {
  //console.log("called number="+calledNumber+"\n companyInfo="+companyInfo.length);
  for (let i = 0; i < companyInfo.length; i++) {
    //console.log("ompanyInfo[i]['_03_numbers']==="+companyInfo[i]['_03_numbers']);
    if (companyInfo[i]['_03_numbers'] == calledNumber) {
      //console.log("cus=="+companyInfo[i]['customer_cd']);
      return companyInfo[i]['customer_cd'];
    }
  }
  return '88888888'
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


async function getDurationUse(duration) {
  let durationArr = duration.toString().split(".");
  if(durationArr[1]){
    if(durationArr[1].length==1){
      return durationArr[0]+'.'+durationArr[1];
    }
  }
  

  let tmp = parseInt(durationArr[1]);
  
  let decimalVal = 0;
  decimalVal = Math.round(tmp / 10);

  if(isNaN(decimalVal)){
    decimalVal = 0;
  }

  let durationUse = 0;
  if (decimalVal > 9) {
    durationUse = parseInt(durationArr[0], 10) + 1;
  } else {
    durationUse = durationArr[0] + '.' + decimalVal;
  }
  return durationUse;
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

    if (XFC === '5039' || XFC === '5040' || XFC === '2204') {
      INOU = 1;
      if (XFC === '2204') {
        INDO = 1;
      } else if (XFC === '5039') {
        INDO = 0;
      } else if (XFC == '5040') {
        INDO = 0;
      }
    } else if (XFB === '5039' || XFB === '5040' || XFB === '2204') {
      INOU = 0
      if (XFB === '2204') {
        INDO = 1;
      } else if (XFB === '5039') {
        INDO = 0;
      } else if (XFB == '5040') {
        INDO = 0;
      }

    }

    if (XFEF === '2233' || XFC === '5039' || XFC === '5040') {
      TRUNKPORT = 1
    } else if (XFEL === '2233' || XFB === '5039' || XFB === '5040') {
      TRUNKPORT = 1;
    } else {
      TRUNKPORT = 0;
    }

    if (INGRPSTNTRUNKNAME.substring(0, 11) === "IPSSHGC26BJ" || INGRPSTNTRUNKNAME.substring(0, 11) === "IPSSHGD37CJ" || INGRPSTNTRUNKNAME.substring(0, 11) === "IPSSHGF59EJ" || INGRPSTNTRUNKNAME.substring(0, 11) === "IPSSHGE48DJ") {
      TRUNKPORT = 1;
    }


  }

  return { TRUNKPORT, XFB, XFC, XFD, XFE, XFEF, XFEL, INOU, INDO, XFEC }

}

