var config = require('./../../config/config');
var db = require('./../../config/database');

module.exports = {

  getTargetDate: async function(date_id) {
    try {
          const query=`SELECT max(date_set)::date as target_date, max(date_set)::date + interval '9 HOURS'  as target_date_added_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
          const targetDateRes= await db.query(query,[]);
          console.log(targetDateRes);
          if(targetDateRes.rows){
              return  {'targetDate' : utcToDate(targetDateRes.rows[0].target_date),'targetDateWithTimezone' : utcToDate(targetDateRes.rows[0].target_date_added_timezone)} ;              
          }
          return {err:'not found'};
      } catch (error) {
          return error;
      }
  },
  deleteTargetDateCDR: async function(targetDate) {
    try {
        const query=`delete FROM cdr_sonus where START_TIME >= '${targetDate}' and start_Time < '${targetDate}'::timestamp + INTERVAL '1' DAY`;
        const deleteTargetDateRes= await db.query(query,[]);
        return deleteTargetDateRes;
    } catch (error) {
        return error;
    }
},
getTargetCDR: async function(targetDate) {
    
    try {
        const query=`SELECT ADDTIME(STARTTIME,'09:00:00') AS ORIGDATE, INANI, INCALLEDNUMBER,ADDTIME(DISCONNECTTIME,'09:00:00') AS STOPTIME, 
        CALLDURATION*0.01 AS DURATION, SESSIONID, STARTTIME, DISCONNECTTIME, CALLDURATION, INGRESSPROTOCOLVARIANT , INGRPSTNTRUNKNAME, GW, CALLSTATUS,
         CALLINGNUMBER, EGCALLEDNUMBER, EGRPROTOVARIANT FROM COLLECTOR_73  where STARTTIME >= '${targetDate}' and 
         startTime < DATE_ADD("${targetDate}", INTERVAL 1 DAY)  AND INGRPSTNTRUNKNAME = 'IPSLFIQ57APRII' AND RECORDTYPEID = 3 order by STARTTIME` ;
        const data= await db.mySQLQuery(query);
        return data;
    } catch (error) {
        return error;
    }
},

  create: async function(data1) {
    try {
    var data = Object.values(JSON.parse(JSON.stringify(data1)));
      for(let i=0;i<data.length;i++){
                const query=`INSERT INTO cdr_sonus(Date_Bill,Orig_ANI,Term_ANI,Stop_Time,Start_Time,Duration,Duration_Use,
                In_OutBound,Dom_Int_Call,Orig_Carrier_ID,Term_Carrier_ID,Transit_Carrier_ID,Selected_Carrier_ID,Billing_Comp_Code,Trunk_Port,
                SONUS_SESSION_ID,SONUS_START_TIME,SONUS_DISCONNECT_TIME,SONUS_CALL_DURATION,SONUS_CALL_DURATION_SECOND,
                SONUS_INANI,SONUS_INCALLEDNUMBER,SONUS_INGRESSPROTOCOLVARIANT,REGISTER_DATE,SONUS_INGRPSTNTRUNKNAME,SONUS_GW,SONUS_CALLSTATUS,
                SONUS_CALLINGNUMBER,SONUS_EGCALLEDNUMBER,SONUS_EGRPROTOVARIANT  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11, $12, $13, $14, 
                  $15, $16, $17, $18, $19, $20,$21, $22, $23, $24, $25, $26, $27, $28, $29, $30) returning cdr_id`;
                let valueArray=[];
                valueArray.push(data[i]['ORIGDATE']);
                valueArray.push(data[i]['INANI']);
                valueArray.push(data[i]['INCALLEDNUMBER']);
                valueArray.push(data[i]['STOPTIME']);
                valueArray.push(data[i]['ORIGDATE']);
                valueArray.push(parseFloat(data[i]['DURATION'],10));
                valueArray.push(parseInt(data[i]['DURATION'],10));
                valueArray.push(0);
                valueArray.push(0);
                valueArray.push(getOrigCarrierID(data[i]['EGRPROTOVARIANT']));
                valueArray.push(getTermCarrierID(data[i]['EGRPROTOVARIANT']));
                valueArray.push('');
                valueArray.push(getSelectedCarrierID(data[i]['EGRPROTOVARIANT']));
                valueArray.push(getCompanyCode("LEAFNET"));
                valueArray.push(0);
                valueArray.push(data[i]['SESSIONID']);
                valueArray.push(data[i]['STARTTIME']);
                valueArray.push(data[i]['DISCONNECTTIME']);
                valueArray.push(data[i]['CALLDURATION']);
                valueArray.push(parseInt(data[i]['DURATION'],10));
                valueArray.push(data[i]['INANI']);
                valueArray.push(data[i]['INCALLEDNUMBER']);
                valueArray.push(data[i]['INGRESSPROTOCOLVARIANT']);
                valueArray.push('now()');
                valueArray.push(data[i]['INGRPSTNTRUNKNAME']);
                valueArray.push(data[i]['GW']);
                valueArray.push(data[i]['CALLSTATUS']);
                valueArray.push(data[i]['CALLINGNUMBER']);
                valueArray.push(data[i]['EGCALLEDNUMBER']);
                valueArray.push(data[i]['EGRPROTOVARIANT']);
                const res = await db.query(query,valueArray);
          }
            return res.rows[0];
    } catch (error) {
        return error;
    }
  },
  updateBatchControl: async function(serviceId,targetDate) {
    try {
        const query=`update batch_date_control set date_set='${targetDate}'::date + interval '2' day , last_update=now() where date_id='${serviceId}'`;
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
        return error;
    }
},
  getProSummaryData: async function(targetDate) {
    try {
      const query=`select count(*) as total FROM cdr_sonus where START_TIME >= '${targetDate}' and start_Time < '${targetDate}'::timestamp + INTERVAL '1' DAY`;
      const getProSummaryDataRes= await db.query(query,[]);
      return getProSummaryDataRes.rows;
    } catch (error) {
      return error;
    }
},
  updateSummaryData: async function(serviceId, targetDateWithTimezone, sonusData, billingServerData) {

    try {
        
        const query=`insert into sonus_outbound_summary (service_id, raw_cdr_cound, pro_cdr_count, summary_date, date_updated) 
        VALUES ($1, $2, $3, $4, $5) returning cdr_id`;

        let valueArray=[];
        valueArray.push(serviceId);
        valueArray.push(parseInt(sonusData.length));
        valueArray.push(parseInt(billingServerData[0]['total']));
        valueArray.push(targetDateWithTimezone);
        valueArray.push(now());

        const updateSummaryDataRes= await db.query(query,valueArray);
        return updateSummaryDataRes;
    } catch (error) {
        return error;
    }
  },
}

function utcToDate(utcDate){
    let newDate='';
    let stDate=utcDate.toISOString();

    try {
      newDate=stDate.replace(/T/,' ').replace(/\..+/, '');
    }catch(err){
      console.log(err.message);
      newDate=stDate;
    }
    return newDate;  
  }

  function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return utcToDate(result);
  }

  function getOrigCarrierID(EGRPROTOVARIANT){
    let origCarrierID = 0;
    console.log("EGRPROTOVARIANT=="+EGRPROTOVARIANT);
    let origStrIndex=EGRPROTOVARIANT.indexOf("0xfb");
    console.log("origStrIndex=="+origStrIndex);

    if(origStrIndex){
      origCarrierID = EGRPROTOVARIANT.substring(origStrIndex+5,origStrIndex+9);
    }
    console.log("origCarrierID=="+origCarrierID);
    return origCarrierID;
  }

  function getTermCarrierID(EGRPROTOVARIANT){
    let termCarrierID = 0;
    let termStrIndex=EGRPROTOVARIANT.indexOf("0xfc");
    if(termStrIndex){
      termCarrierID = EGRPROTOVARIANT.substring(termStrIndex+5,termStrIndex+9);
    }
    return termCarrierID;
  }

  function getSelectedCarrierID(EGRPROTOVARIANT){
    let selectedCarrierID = 0;
    let selStrIndex=EGRPROTOVARIANT.indexOf("0xfd");
    if(selStrIndex){
      selectedCarrierID = EGRPROTOVARIANT.substring(selStrIndex+5,selStrIndex+9);
    }
    return selectedCarrierID;
  }

  function getCompanyCode(companyName){
    let companyCode='99999999';
    if(companyName=='LEAFNET'){
      companyCode='00000594';
    }
    return companyCode;
  }