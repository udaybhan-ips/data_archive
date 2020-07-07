var config = require('./../../config/config');
var db = require('./../../config/database');

module.exports = {
  getTargetDate: async function(date_id) {
      try {
          const query=`SELECT max(date_set)::date FROM batch_date_control where date_id=${date_id} and deleted=false`;
          const rateListRes= await db.query(query,[]);
          return rateListRes.rows;
      } catch (error) {
          return error;
      }
  },
  deleteTargetDateCDR: async function(targetDate) {
    try {
        const query=`delete FROM cdr_sonus where start_time::date='${targetDate}'::date`;
        const deleteTargetDateRes= await db.query(query,[]);
        return deleteTargetDateRes.rows;
    } catch (error) {
        return error;
    }
},
getTargetCDR: async function(targetDate) {
    try {
        const query=`SELECT ADDTIME(STARTTIME,'09:00:00') AS ORIGDATE, INANI, INCALLEDNUMBER,ADDTIME(DISCONNECTTIME,'09:00:00') AS STOPTIME,
        CALLDURATION*0.01 AS DURATION, SESSIONID, STARTTIME, DISCONNECTTIME, CALLDURATION, INGRESSPROTOCOLVARIANT , INGRPSTNTRUNKNAME, GW,
        CALLSTATUS, CALLINGNUMBER, EGCALLEDNUMBER, EGRPROTOVARIANT FROM COLLECTOR_73 where (STARTTIME BETWEEN ${targetDate}- Interval '1 day' || '15:00:00'
        " 15:00:00' and '" & DATE_VALU & " 14:59:59')`;
        const rateListRes= await db.query(query,[]);
        return rateListRes.rows;
    } catch (error) {
        return error;
    }
},

  create: async function(data) {
    console.log(data);
    try {
      //  if(validateRateData()){
            const query=`INSERT INTO cdr_sonus_rate (company_code, carrier_code, carrier_name, call_sort, 
                date_start, date_expired, rate_setup, rate_second, date_updated, currnet_flag  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning rate_id`;
            const value= [data.company_code, data.carrier_code, data.carrier_name, data.call_sort, 
                data.date_start, data.date_expired, data.rate_setup, data.rate_second, 'now()', data.current_flag];
            const res = await db.query(query,value);
            return res.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },

  
}

