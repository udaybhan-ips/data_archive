var db = require('../../config/database');
const { BATCH_SIZE } = require('../../config/config');
const utility = require('../../public/javascripts/utility')

let ColumnSetDMS = ['date_bill', 'orig_ani', 'term_ani', 'start_time', 'stop_time', 'duration', 'duration_use', 'in_outbound','dom_int_call', 'orig_carrier_id', 'term_carrier_id', 'transit_carrier_id', 'selected_carrier_id', 'billing_company_code', 'trunk_port','sonus_session_id', 'sonus_start_time', 'sonus_disconnect_time', 'sonus_call_duration', 'sonus_call_duration_second', 'sonus_incallednumber', 'sonus_ingressprotocolvariant', 'sonus_ingrpstntrunkname', 'sonus_gw', 'sonus_callstatus','sonus_callingnumber', 'sonus_egcallednumber','sonus_egrprotovariant'];

module.exports = {

  getTargetDate: async function(date_id = 10) {
    try {
          const query=`SELECT date_id , date_set::date + interval '1' day as next_run_time  ,  (date_set)::date + interval '0 HOURS' as target_date , (date_set)::date - interval '9 HOURS'  as target_date_with_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
          const targetDateRes= await db.query(query,[]);
          
          if(targetDateRes.rows){
              return  {'id':(targetDateRes.rows[0].date_id), 'next_run_time': (targetDateRes.rows[0].next_run_time) , 'targetDate' : (targetDateRes.rows[0].target_date),'targetDateWithTimezone' : (targetDateRes.rows[0].target_date_with_timezone)} ;              
          }
          return {err:'not found'};
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
      return `cdr_dms_${year}${month}`;

    } catch (e) {
      console.log("err in get table=" + e.message);
      return console.error(e);
    }
  },

  createTable: async function (tableName) {
    try {
      const query =` CREATE TABLE IF NOT EXISTS "${tableName}" ("cdr_id" BIGSERIAL, "date_bill" TIMESTAMP WITHout TIME ZONE not null , orig_ani VARCHAR , term_ani VARCHAR,
      "start_time" TIMESTAMP WITHout TIME ZONE not null , "stop_time" TIMESTAMP WITHout TIME ZONE not null
       ,"duration" VARCHAR(255), "duration_use" VARCHAR(255),
       "dom_int_call" VARCHAR(255), "orig_carrier_id" VARCHAR(255),
      "selected_carrier_id" VARCHAR, "billing_company_code" VARCHAR, "trunk_port" VARCHAR, "sonus_session_id" VARCHAR,
      "sonus_start_time" TIMESTAMP WITHOUT TIME ZONE, "sonus_disconnect_time" TIMESTAMP WITHout TIME ZONE, "sonus_call_duration" VARCHAR,
      "sonus_call_duration_second" VARCHAR, "sonus_anani" VARCHAR, "sonus_incallednumber" VARCHAR, "sonus_ingressprotocolvariant" VARCHAR,
      "registerdate" TIMESTAMP WITHOUT TIME ZONE, "sonus_ingrpstntrunkname" VARCHAR, "sonus_gw" VARCHAR, "sonus_callstatus" VARCHAR,
      "sonus_callingnumber" VARCHAR, "sonus_egcallednumber" VARCHAR, "sonus_egrprotovariant" VARCHAR, "createdAt" TIMESTAMP WITHOUT TIME ZONE ,
      "updatedAt" TIMESTAMP WITHOUT TIME ZONE , in_outbound integer, term_carrier_id varchar, transit_carrier_id varchar, PRIMARY KEY ("cdr_id")) ` ;

      const tableCreationRes = db.query(query, []);
      if(tableCreationRes ){
        return tableCreationRes;
      }

      throw new Error("Error while creating table..."+tableCreationRes)

    } catch (e) {
      throw new Error("Error while creating table..."+e.message)
    }
  },

  sendErrorEmail: async function (getTableNameRes, targetDate) {
    try {
      const html = `Hi, \\n
      There is something error in dms table creating and batch control table!! \\n
      table is ${getTableNameRes} and ${targetDate} \\n
      Thank you`;
      let mailOption = {
        from: 'ips_tech@sysmail.ipsism.co.jp',
        to: 'uday@ipspro.co.jp',
      //  cc:'uday@ipspro.co.jp',
        subject:'Please check the dms batch date & table!!',
        html
      }
      utility.sendEmail(mailOption);     
    } catch (e) {
      throw new Error("Error while sending email..."+e.message)
    }
  },

  checkTableExist: async function (tableName) {
    try {
      let checkTableExistRes = false; 
      const query = `SELECT EXISTS ( SELECT FROM information_schema.tables WHERE  table_schema ='public' AND table_name = '${tableName}' )` ;
      checkTableExistRes = await db.query(query,[]);
      if (checkTableExistRes && checkTableExistRes.rows) {
        return checkTableExistRes.rows[0]['exists']
      }
      return checkTableExistRes;

    } catch (e) {
      console.log("err in get table=" + e.message);
      throw new Error("Error in checking table exist!!"+e.message)
    }
  },

  deleteTargetDateCDR: async function(targetDate, tableName) {
    try {
        const query=`delete FROM ${tableName} where START_TIME::date = '${targetDate}'::date`;
        const deleteTargetDateRes= await db.query(query,[]);
        return deleteTargetDateRes;
    } catch (error) {
        return error;
    }
},

getTargetCDR: async function(targetDateWithTimezone) {
    
  try {
       const query= `SELECT ADDTIME(STARTTIME,'09:00:00') AS ORIGDATE, INANI, INCALLEDNUMBER,ADDTIME(DISCONNECTTIME,'09:00:00') AS STOPTIME,
       CALLDURATION*0.01 AS DURATION, SESSIONID, STARTTIME, DISCONNECTTIME, CALLDURATION, INGRESSPROTOCOLVARIANT , INGRPSTNTRUNKNAME, GW,
        CALLSTATUS, CALLINGNUMBER, EGCALLEDNUMBER, EGRPROTOVARIANT FROM COLLECTOR_73  
        where STARTTIME >= '${targetDateWithTimezone}' and startTime < DATE_ADD("${targetDateWithTimezone}", INTERVAL 1 DAY) 
        AND (CALLDURATION > 0)
        AND (SERVICEPROVIDER ='IPS')  
        and  RECORDTYPEID = 3 
        AND (OUTGOING <> 'UNKNOWN')
        order by STARTTIME `

      const data = await db.mySQLQuery(query);
      return data;
  } catch (error) {
      return error;
  }
},

  insertByBatches: async function(tableName, records) {
    const JSON_data = Object.values(JSON.parse(JSON.stringify(records)));
    const chunkArray=chunk(JSON_data,BATCH_SIZE);
    //console.log(dataSize);
    let res=[];
    let resArr=[];
    for(let i=0;i<chunkArray.length;i++){
      const data =  getNextInsertBatch(chunkArray[i]);
      res = await db.queryBatchInsertSonusWithColumnSet(data,ColumnSetDMS, { table: tableName });
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

    // if(termCarrierID=='2GSX' || termCarrierID=='AN,0')
    //   termCarrierID='5039';

    return termCarrierID;
  }
  

  function getTransistCarrierID(EGRPROTOVARIANT){
    let selectedCarrierID = 0;
    let selStrIndex=EGRPROTOVARIANT.indexOf("0xfe");
    if(selStrIndex){
      selectedCarrierID = EGRPROTOVARIANT.substring(selStrIndex+5,selStrIndex+9);
    }
    return selectedCarrierID;
  }

  function getSelectedCarrierID(EGRPROTOVARIANT){
    let selectedCarrierID = 0;
    let selStrIndex=EGRPROTOVARIANT.indexOf("0xfd");
    if(selStrIndex){
      selectedCarrierID = EGRPROTOVARIANT.substring(selStrIndex+5,selStrIndex+9);
    }
    return selectedCarrierID;
  }



  function getNextInsertBatch(data) {
    
    let valueArray=[];

    try {
     for(let i=0;i<data.length;i++){
       
       let obj={};
       obj['date_bill']=data[i]['ORIGDATE'];
       obj['orig_ani']=data[i]['INANI'];
       obj['term_ani']=data[i]['INCALLEDNUMBER'];
       obj['stop_time']=data[i]['STOPTIME'];
       obj['start_time']=data[i]['ORIGDATE'];
       obj['duration']=parseFloat(data[i]['DURATION'],10);
       obj['duration_use']=Math.ceil(data[i]['DURATION']);
       obj['in_outbound']=0;
       obj['dom_int_call']=0;
       obj['orig_carrier_id']=getOrigCarrierID(data[i]['INGRESSPROTOCOLVARIANT']);
       obj['term_carrier_id']=getTermCarrierID(data[i]['INGRESSPROTOCOLVARIANT']);
       obj['transit_carrier_id']=getTransistCarrierID(data[i]['INGRESSPROTOCOLVARIANT']);
       obj['selected_carrier_id']=getSelectedCarrierID(data[i]['INGRESSPROTOCOLVARIANT']);
       obj['billing_company_code']="DMS";
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
      console.log("err"+err);
     }
    
    return valueArray;

  }

function chunk(array, size) {

  console.log("chunk"+size);

  const chunked_arr = [];
  let copied = [...array]; // ES6 destructuring
  const numOfChild = Math.ceil(copied.length / size); // Round up to the nearest integer
  for (let i = 0; i < numOfChild; i++) {
    chunked_arr.push(copied.splice(0, size));
  }
  return chunked_arr;
}