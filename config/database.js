var Promise = require('promise');
var config = require('./config');
const {Pool, types} = require('pg');
var mysql =require('mysql');
const pgp = require('pg-promise')({
  capSQL: true
});



var connectionStringPortal = config.DATABASE_URL_IPS_PORTAL;
var connectionString =  config.DATABASE_URL_SONUS_DB;

const CDR_SONUS_CS = new pgp.helpers.ColumnSet(['date_bill','orig_ani','term_ani','start_time','stop_time','duration','duration_use','in_outbound','dom_int_call','orig_carrier_id','term_carrier_id','transit_carrier_id','selected_carrier_id','billing_comp_code','trunk_port','sonus_session_id','sonus_start_time','sonus_disconnect_time','sonus_call_duration','sonus_call_duration_second','sonus_inani','sonus_incallednumber','sonus_ingressprotocolvariant','register_date','sonus_ingrpstntrunkname','sonus_gw','sonus_callstatus','sonus_callingnumber','sonus_egcallednumber','sonus_egrprotovariant'] , {table: 'cdr_sonus'});
const CDR_SONUS_OUTBOUND_CS = new pgp.helpers.ColumnSet(['date_bill','orig_ani','term_ani','start_time','stop_time','duration','duration_use','in_outbound','dom_int_call','orig_carrier_id','term_carrier_id','transit_carrier_id','selected_carrier_id','billing_comp_code','billing_comp_name','trunk_port','sonus_session_id','sonus_start_time','sonus_disconnect_time','sonus_call_duration','sonus_call_duration_second','sonus_inani','sonus_incallednumber','sonus_ingressprotocolvariant','register_date','sonus_ingrpstntrunkname','sonus_gw','sonus_callstatus','sonus_callingnumber','sonus_egcallednumber','sonus_egrprotovariant'] , {table: 'cdr_sonus_outbound'});
    
const billingCS = new pgp.helpers.ColumnSet(['cdr_id', 'rate_id', 'bill_number', 'bill_date', 'bleg_call_amount', 'ips_call_amount', 'remarks'],{table: 'cdr_sonus_billing'});
const CS={'cdr_sonus_cs':CDR_SONUS_CS, 'billing_cs':billingCS, 'cdr_sonus_outbound_cs':CDR_SONUS_OUTBOUND_CS};


module.exports = {
  queryBatchInsert: async function(data, cs){
    
    const db_pgp = pgp(config.DATABASE_URL_SONUS_DB);
    const query = pgp.helpers.insert(data, CS[cs]);
    
    let res=await db_pgp.none(query);

    console.log(res);
    return res;
  },
  query: async function(text, values, ipsPortal) {
    console.log("query="+text+"----"+values);
       try{
         types.setTypeParser(1114, function(stringValue) {
           return stringValue;
          })
          if(ipsPortal){
            connectionString = connectionStringPortal;
          }else{
            connectionString = config.DATABASE_URL_SONUS_DB;
          }
          const pool = await new Pool(connectionString)
          const res = await pool.query(text,values);
         
          return (res);
       }catch(err){
          
          console.error("Error while quering" +err)
          return handleErrorMessages(err);
       }

      },
   mySQLQuery: function(text, values) {
        //console.log("mysql connection string is=  "+mySQLConnectionString.MYSQL);
        console.log("query="+text+"----"+values);
        const connection=mysql.createConnection({
          host     : '192.168.11.252',
          user     : 'ips',
          password : 'ips0032',
          database : 'epart',
          timezone: 'Z'
        });
        connection.connect();

        return new Promise(function(resolve, reject) {
            connection.query(text, function(err, result) {
              if (err) {
                console.log("error while querying data from SONUS");
                console.log(err);
                handleErrorMessages(err)
                  .then(function(message) {
                    reject(message);
                  })
                  .catch(function() {
                    reject();
                  });
              }
              else {
                resolve(result);
              }
            });
          });
      }
};


// module.exports = {
 
// };


function handleErrorMessages(err) {
  return new Promise(function(resolve, reject) {
    if (err.code == '23505') {
      err = 'email already in use, please use a different one'
    }
    if (err.code == '22P02') {
      err = 'invalid user UUID'
    }
    else if (process.env.NODE_ENV !== 'development') {
      err = 'something went wrong, please check your input and try again'
    }
    resolve(err);
  });
}