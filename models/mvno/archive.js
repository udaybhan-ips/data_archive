var db = require('./../../config/database');
const { BATCH_SIZE } = require('../../config/config');
const CDR_MVNO_CS='cdr_mvno_cs';

module.exports = {

  getTargetDate: async function(date_id) {
    try {
          const query=`SELECT date_id , date_set::date + interval '1' day as next_run_time  ,  (date_set)::date + interval '0 HOURS' as target_date , (date_set)::date - interval '9 HOURS'  as target_date_with_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
          const targetDateRes= await db.query(query,[]);
          //console.log(targetDateRes);
          if(targetDateRes.rows){
              return  {'id':(targetDateRes.rows[0].date_id), 'next_run_time': (targetDateRes.rows[0].next_run_time) , 'targetDate' : (targetDateRes.rows[0].target_date),'targetDateWithTimezone' : (targetDateRes.rows[0].target_date_with_timezone)} ;              
          }
          return {err:'not found'};
      } catch (error) {
          return error;
      }
  },
  getMVNOCustomerList: async function() {
    try {
          const query=`select id,customer_name, customer_id, trunk_port, incallednumber from mvno_customer where deleted = false order by customer_name`;
          const sonusCustList= await db.query(query,[], true);
          //console.log(targetDateRes);
          if(sonusCustList.rows){
              return sonusCustList.rows ;              
          }
          return {err:'not found'};
      } catch (error) {
          return error;
      }
  },
  getRates: async function(customerId, customerName) {
    try {
        let where = "";

        if(customerId){
          where = `WHERE customer_id= '${customerId}' `;
        }
        const query=`select customer_id, landline, mobile from mvno_rates ${where} `;
        const ratesRes= await db.query(query,[], ipsPortal=true);
        
        if(ratesRes.rows){
            return (ratesRes.rows);              
        }
        return {err:'not found'};
    } catch (error) {
        return error; 
    }
  },
  getFPhoneRates: async function() {
    try {
       
        const query=`select * from cdr_fphone_rate `;
        const ratesRes= await db.queryIBS(query,[]);
        
        if(ratesRes.rows){
            return (ratesRes.rows);              
        }
        return {err:'not found'};
    } catch (error) {
        return error; 
    }
  },
  getFPhoneCarrierChage: async function() {
    try {
       
        const query=`select * from cdr_fphone_carrier_change `;
        const ratesRes= await db.queryIBS(query,[]);
        
        if(ratesRes.rows){
            return (ratesRes.rows);              
        }
        return {err:'not found'};
    } catch (error) {
        return error; 
    }
  },
  getFPhoneRelayCarrier: async function() {
    try {
       
        const query=`select * from cdr_fphone_relay_carrier`;
        const ratesRes= await db.queryIBS(query,[]);
        
        if(ratesRes.rows){
            return (ratesRes.rows);              
        }
        return {err:'not found'};
    } catch (error) {
        return error; 
    }
  },
  getFPhoneTermUse: async function() {
    try {
       
        const query=`select * from carrier`;
        const ratesRes= await db.queryIBS(query,[]);
        
        if(ratesRes.rows){
            return (ratesRes.rows);              
        }
        return {err:'not found'};
    } catch (error) {
        return error; 
    }
  },
  deleteTargetDateCDR: async function(targetDateWithTimezone, customerId, customerName) {
    try {
        let ANDclo = "";

        
        const query=`delete FROM calltemp_excel2 where STARTTIME BETWEEN '${targetDateWithTimezone}' and 
        DATEADD(day, 1, '${targetDateWithTimezone}') `;
        const deleteTargetDateRes= await db.queryIBS(query,[]);
        return deleteTargetDateRes;
    } catch (error) {
        console.log("Err "+ error.message);
        return error;
    }
  },
getTargetCDR: async function(targetDateWithTimezone, customerInfo, trunkPortsVal, type) {
  try {
      
      const query=`SELECT * FROM CALL WITH(NOLOCK) WHERE STARTTIME BETWEEN '${targetDateWithTimezone}' and 
      DATEADD(day, 1, '${targetDateWithTimezone}') AND (CALLDIRECTION = 'O') AND (CONNECTSECONDS > 0) ORDER BY STARTTIME ` ;
      //console.log("query="+query);
      const data= await db.msSQLServer(query);

     // console.log(JSON.stringify(data.recordset))

      return data.recordset;
    }catch (error) {
      console.log("err="+error.message);
      return error;
    }

},

  insertByBatches: async function(records, customerInfo, ratesInfo) {
  
    const JSON_data = Object.values(JSON.parse(JSON.stringify(records)));
    //st dataSize=JSON_data.length;
    const chunkArray= await chunk(JSON_data,BATCH_SIZE);
   // console.log(JSON.stringify(chunkArray));
    //console.log(JSON.stringify(customerInfo));
    let res=[];
    let resArr=[];
    for(let i=0;i<chunkArray.length;i++){
      const data = await getNextInsertBatch(chunkArray[i], customerInfo, ratesInfo);
      //console.log("data="+JSON.stringify(data));
      res=await db.queryBatchInsert(data,CDR_MVNO_CS);
      resArr.push(res);
    }
    console.log("done"+ new Date());
    console.log(resArr);
    return resArr;

  },

  deleteTargetDateCDRFPhone: async function(targetDate, leg) {
    try {
        
        const query=`delete FROM cdr_fphone where START_TIME BETWEEN '${targetDate}' and DATEADD(day, 1, '${targetDate}') and leg='${leg}'`;
        const deleteTargetDateRes= await db.queryIBS(query,[]);
        return deleteTargetDateRes;
    } catch (error) {
        console.log("Err "+ error.message);
        return error;
    }
  },
getTargetCDRFPhone: async function(targetDateWithTimezone, leg) {
  try {
      
      let where = ""; 
      if(leg=='A'){
        where =`WHERE STARTTIME >= '${targetDateWithTimezone}' and startTime < DATE_ADD("${targetDateWithTimezone}", INTERVAL 1 DAY)  
        AND (GW IN ('NFPGSX4','IPSGSX5')) 
        AND (CALLDURATION > 0)
        AND RECORDTYPEID = 3 
        AND ((INCALLEDNUMBER like '00322223%') OR (INCALLEDNUMBER like '00322224%') OR (INCALLEDNUMBER like '00322225%'))
        order by STARTTIME asc`;
      }else{
        where =`WHERE STARTTIME >= '${targetDateWithTimezone}' and startTime < DATE_ADD("${targetDateWithTimezone}", INTERVAL 1 DAY)  
        AND (GW IN ('NFPGSX4','IPSGSX5')) 
        AND (CALLDURATION > 0)
        AND RECORDTYPEID = 3 
        AND (INGRPSTNTRUNKNAME='IPSSONW5Z3PRII')
        order by STARTTIME asc`;
      }

      const query=`SELECT GW, SESSIONID, CALLDURATION, STARTTIME, ADDTIME(STARTTIME,'09:00:00') AS BEGINTIME, DISCONNECTTIME, ADDTIME(DISCONNECTTIME,'09:00:00') AS STOPTIME,
      TRUNCATE(CALLDURATION*0.01 +  0.9,  0) AS DURATION, INANI, INGRPSTNTRUNKNAME,
      OUTGOING, INCALLEDNUMBER, CALLINGPARTYCATEGORY, EGCALLEDNUMBER, INGRESSPROTOCOLVARIANT,CALLSTATUS FROM COLLECTOR_73 ${where}`;


      //console.log("query="+query);
      const data= await db.msSQLServer(query);

     // console.log(JSON.stringify(data.recordset))

      return data.recordset;
    }catch (error) {
      console.log("err="+error.message);
      return error;
    }

},

  insertByBatchesFPhone: async function(records, leg , ratesInfo) {
  
    const JSON_data = Object.values(JSON.parse(JSON.stringify(records)));
    //st dataSize=JSON_data.length;
    const chunkArray= await chunk(JSON_data,BATCH_SIZE);
   // console.log(JSON.stringify(chunkArray));
    //console.log(JSON.stringify(customerInfo));
    let res=[];
    let resArr=[];
    for(let i=0;i<chunkArray.length;i++){
      const data = await getNextInsertBatch(chunkArray[i], leg, ratesInfo);
      //console.log("data="+JSON.stringify(data));
      res=await db.queryBatchInsert(data,CDR_MVNO_CS);
      resArr.push(res);
    }
    console.log("done"+ new Date());
    console.log(resArr);
    return resArr;

  },


  updateBatchControl: async function(serviceId,targetDate,api) {
    let query;
    try {
        if(api){
          query=`update batch_date_control set date_set='${targetDate}'::date + interval '0' day , last_update=now() where date_id='${serviceId}'`;
        }else{
          query=`update batch_date_control set date_set='${targetDate}'::date + interval '1' day , last_update=now() where date_id='${serviceId}'`;
        }
        
        const updateBatchControlRes= await db.query(query,[]);
        return updateBatchControlRes;
    } catch (error) {
        return error;
    }
  },
  deleteTargetDateSummary: async function(serviceId, targetDate) {
    try {
        const query=`delete FROM sonus_outbound_summary where summary_date::date = '${targetDate}'::date + interval '1' day and service_id='${serviceId}'`;
        const deleteTargetDateSummaryRes= await db.query(query,[]);
        return deleteTargetDateSummaryRes;
    } catch (error) {
        console.log("Err "+ error.message);
        return error;
    }
},



  getProSummaryData: async function(targetDate) {
    try {
      const query=`select sum(duration_use), round(sum(mob_amount)) as mob_amount , round(sum(landline_amount)) as landline_amount, billing_comp_name  from cdr_sonus_outbound where start_time >='2021-02-01 00:00:00' and start_time <='2021-02-28 23:59:59' group by billing_comp_name`;
      const getProSummaryDataRes= await db.query(query,[]);
      return getProSummaryDataRes.rows;
    } catch (error) {
      console.log("Err "+ error.message);
      return error;
    }
},

}


async function getMVNORates(data, carrier_id, leg) {
  let res = {};

  console.log("comp code=="+carrier_id);
  console.log("data=="+data.length);

  try{
    for (let i = 0; i < data.length; i++) {
      if (data[i]['carrier_id'] == carrier_id) {
        if(leg=='A'){
          res['term_use'] = data[i]['carrier_terminal'];
          res['aleg_setup'] = data[i]['aleg_setup'];
          res['aleg_rate'] = data[i]['aleg_rate'];         
        }else{
          res['bleg_setup'] = data[i]['bleg_setup'];
          res['bleg_rate'] = data[i]['bleg_rate'];
        }
        
        break;
      }
    }

  }catch(err){
    console.log("error in get rates");
  }
  
  return res;
}

  async function  getNextInsertBatch(data, leg ,ratesInfo) {
    
    let valueArray=[];
    let freqRate = 0.05 ;
    console.log("inserting data")

    try {
     for(let i=0;i<data.length;i++){
      // let compInfo = await getCompanyInfo(data[i]['INGRPSTNTRUNKNAME'], customerInfo, data[i]['INCALLEDNUMBER'] );
       //let amountDet = await getBillingAmount(compInfo, data[i]['EGCALLEDNUMBER'] ,ratesInfo, data[i]['DURATION']);

       let obj={};
       const {  XFB, XFC, XFD, XFE } = await getInOutbound(data[i]['INGRESSPROTOCOLVARIANT'], data[i]['INGRPSTNTRUNKNAME']);
       const rateInfo = await getMVNORates(ratesInfo, XFB, leg);

       let duration = Math.ceil(parseFloat(data[i]['DURATION']));

       obj['stop_time'] = data[i]['STOPTIME'];
       obj['start_time'] = data[i]['ORIGDATE'];
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
       obj['sonus_gw'] = data[i]['GW'];
       obj['sonus_callstatus'] = data[i]['CALLSTATUS'];

       obj['leg'] = leg;
       obj['setup_rate'] = rateInfo['setup_rate'];
       obj['call_rate'] = rateInfo['call_rate'];
       obj['call_charge'] = (duration * rateInfo['call_rate'])+  rateInfo['setup_rate']+ (duration*freqRate); 
       obj['term_use'] = rateInfo['term_use'];
       obj['carrier_name'] = rateInfo['carrier_name'];
       obj['bleg_term_id'] = XFB;
       obj['company_code'] = '10000707';
       obj['freq_rate'] = freqRate;
       
       valueArray.push(obj);
       
     }
    }catch(err){
      console.log("err"+err.message);
     }
    
    return valueArray;
  }
async function chunk(array, size) {

  console.log("chunk"+size);

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

  return {  XFB, XFC, XFD, XFE}

}
