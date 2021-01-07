var db = require('./../../config/database');
const { BATCH_SIZE } = require('../../config/config');
const CDR_SONUS_OUTBOUND_CS='cdr_sonus_outbound_cs';

module.exports = {

  getTargetDate: async function(date_id) {
    try {
          const ipsPortal=true;
          const query=`SELECT max(date_set)::date + interval '0 HOURS' as target_date , max(date_set)::date - interval '9 HOURS'  as target_date_with_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
          const targetDateRes= await db.query(query,[]);
         // console.log(targetDateRes);
          if(targetDateRes.rows){
              return  {'targetDate' : (targetDateRes.rows[0].target_date),'targetDateWithTimezone' : (targetDateRes.rows[0].target_date_with_timezone)} ;              
          }
          return {err:'not found'};
      } catch (error) {
          return error;
      }
  },
  getAllTrunkgroup: async function() {
    try {
          const query=`select trunk_port, customer_name, customer_id,incallednumber from sonus_outbound_customer `;
          const ipsPortal=true;
          const getTrunkportRes= await db.query(query,[],ipsPortal);
        //  console.log(getTrunkportRes);
          if(getTrunkportRes.rows){
              return  getTrunkportRes.rows;
            }
          return {err:'not found'};
      } catch (error) {
          console.log("Err "+ error.message);
          return error;
      }
  },
  
  deleteTargetDateCDR: async function(targetDate) {
    try {
        const query=`delete FROM cdr_sonus_outbound where START_TIME::date = '${targetDate}'::date`;
        const deleteTargetDateRes= await db.query(query,[]);
        return deleteTargetDateRes;
    } catch (error) {
        console.log("Err "+ error.message);
        return error;
    }
  },
getTargetCDR: async function(targetDateWithTimezone, customerInfo) {
  try {
      let where='';
      let trunkPortsVal='';

      if(customerInfo['incallednumber']){ 
        where=` WHERE STARTTIME >= '${targetDateWithTimezone}' and startTime < DATE_ADD ("${targetDateWithTimezone}", INTERVAL 1 DAY) AND 
        INGRPSTNTRUNKNAME in ('${customerInfo.trunk_port}') AND incallednumber like '${customerInfo['incallednumber']}' AND RECORDTYPEID = 3 order by STARTTIME `;
      }else{
        let trunkPorts = customerInfo.trunk_port;
        let trunkPortsArr = trunkPorts.split(",");

        for(let i=0; i<trunkPortsArr.length;i++){
          trunkPortsVal = trunkPortsVal + `'${trunkPortsArr[i]}',`;
        }
        //remove last value (,)
        if(trunkPortsVal.substr(trunkPortsVal.length - 1)==','){
          trunkPortsVal = trunkPortsVal.substring(0, trunkPortsVal.length - 1);
        }

        where=`WHERE STARTTIME >= '${targetDateWithTimezone}' and startTime < DATE_ADD ("${targetDateWithTimezone}", INTERVAL 1 DAY)  AND INGRPSTNTRUNKNAME in (${trunkPortsVal}) AND RECORDTYPEID = 3 order by STARTTIME `;
      }

      //console.log("where="+where);
      
      const query=`SELECT ADDTIME(STARTTIME,'09:00:00') AS ORIGDATE, INANI, INCALLEDNUMBER,ADDTIME(DISCONNECTTIME,'09:00:00') AS STOPTIME, 
      CALLDURATION*0.01 AS DURATION, SESSIONID, STARTTIME, DISCONNECTTIME, CALLDURATION, INGRESSPROTOCOLVARIANT , INGRPSTNTRUNKNAME, GW, CALLSTATUS,
      CALLINGNUMBER, EGCALLEDNUMBER, EGRPROTOVARIANT FROM COLLECTOR_73  ${where} ` ;
      //console.log("query="+query);
      const data= await db.mySQLQuery(query);
      return data;
    }catch (error) {
      console.log("err="+error.message);
      return error;
    }
},
  insertByBatches: async function(records, customerInfo) {
  
    const JSON_data = Object.values(JSON.parse(JSON.stringify(records)));
    const dataSize=JSON_data.length;
    const chunkArray= await chunk(JSON_data,BATCH_SIZE);
    //console.log(chunkArray);
    //console.log(JSON.stringify(customerInfo));
    let res=[];
    let resArr=[];
    for(let i=0;i<chunkArray.length;i++){
      const data = await getNextInsertBatch(chunkArray[i], customerInfo);
      //console.log("data="+JSON.stringify(data));
      res=await db.queryBatchInsert(data,CDR_SONUS_OUTBOUND_CS);
      resArr.push(res);
    }
    console.log("done"+ new Date());
    console.log(resArr);
    return resArr;

  },

  updateBatchControl: async function(serviceId,targetDate) {
    try {
        const query=`update batch_date_control set date_set='${targetDate}'::date + interval '1' day , last_update=now() where date_id='${serviceId}'`;
        const updateBatchControlRes= await db.query(query,[]);
        return updateBatchControlRes;
    } catch (error) {
        console.log("Err "+ error.message);
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
      const query=`select count(*) as total FROM cdr_sonus where START_TIME >= '${targetDate}' and start_Time < '${targetDate}'::timestamp + INTERVAL '1' DAY`;
      const getProSummaryDataRes= await db.query(query,[]);
      return getProSummaryDataRes.rows;
    } catch (error) {
      console.log("Err "+ error.message);
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
        console.log("Err "+ error.message);
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
    let origStrIndex=EGRPROTOVARIANT.indexOf("0xfb");
    if(origStrIndex){
      origCarrierID = EGRPROTOVARIANT.substring(origStrIndex+5,origStrIndex+9);
    }
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

  async function getCompanyInfo(trunkPort, customerInfo,incallednumber){
    let res={};
    let startDigitofInCallNum=incallednumber.substring(0,3)+'%';
    
      if(customerInfo['incallednumber']==startDigitofInCallNum){        
        res['comp_code']=customerInfo['customer_id'];
        res['comp_name']=customerInfo['customer_name'];
      }else {
        let trunkPortsArr = customerInfo['trunk_port'].split(",");
        for(let i=0; i<trunkPortsArr.length; i++){
          if(trunkPortsArr[i]==trunkPort){
            res['comp_code']=customerInfo['customer_id'];
            res['comp_name']=customerInfo['customer_name'];
          }
        }  
      }
      
          
    //console.log(JSON.stringify(res));
    return res;
  }
  async function  getNextInsertBatch(data, customerInfo) {
    
    let valueArray=[];
    console.log("inserting data")

    try {
     for(let i=0;i<data.length;i++){
       let compInfo = await getCompanyInfo(data[i]['INGRPSTNTRUNKNAME'], customerInfo, data[i]['INCALLEDNUMBER'] );     
       let obj={};
       obj['date_bill']=data[i]['ORIGDATE'];
       obj['orig_ani']=data[i]['INANI'];
       obj['term_ani']=data[i]['INCALLEDNUMBER'];
       obj['stop_time']=data[i]['STOPTIME'];
       obj['start_time']=data[i]['ORIGDATE'];
       obj['duration']=parseFloat(data[i]['DURATION'],10);
       obj['duration_use']=parseInt(data[i]['DURATION'],10);
       obj['in_outbound']=0;
       obj['dom_int_call']=0;
       obj['orig_carrier_id']=getOrigCarrierID(data[i]['EGRPROTOVARIANT']);
       obj['term_carrier_id']=getTermCarrierID(data[i]['EGRPROTOVARIANT']);
       obj['transit_carrier_id']='';
       obj['selected_carrier_id']=getSelectedCarrierID(data[i]['EGRPROTOVARIANT']);
       obj['billing_comp_code']= compInfo.comp_code;
       obj['billing_comp_name']= compInfo.comp_name;
       obj['trunk_port']=0;
       obj['sonus_session_id']=data[i]['SESSIONID'];
       obj['sonus_start_time']=data[i]['STARTTIME'];
       obj['sonus_disconnect_time']=data[i]['DISCONNECTTIME'];
       obj['sonus_call_duration']=data[i]['CALLDURATION'];
       obj['sonus_call_duration_second']=parseInt(data[i]['DURATION'],10);
       obj['sonus_inani']=data[i]['INANI'];
       obj['sonus_incallednumber']=data[i]['INCALLEDNUMBER'];
       obj['sonus_ingressprotocolvariant']=data[i]['INGRESSPROTOCOLVARIANT'];
       obj['register_date']='now()';
       obj['sonus_ingrpstntrunkname']=data[i]['INGRPSTNTRUNKNAME'];
       obj['sonus_gw']=data[i]['GW'];
       obj['sonus_callstatus']=data[i]['CALLSTATUS'];
       obj['sonus_callingnumber']=data[i]['CALLINGNUMBER'];
       obj['sonus_egcallednumber']=data[i]['EGCALLEDNUMBER'];
       obj['sonus_egrprotovariant']=data[i]['EGRPROTOVARIANT'];  
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