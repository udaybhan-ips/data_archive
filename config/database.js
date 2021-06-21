var Promise = require('promise');
var config = require('./config');
const Cursor = require('pg-cursor')
const {Pool, types} = require('pg');
var mysql =require('mysql');
var util = require('../public/javascripts/utility');

const { resolve, reject } = require('promise');

let numOfRows=100000;

const pgp = require('pg-promise')({
  capSQL: true
});



var connectionStringPortal = config.DATABASE_URL_IPS_PORTAL;
var connectionString =  config.DATABASE_URL_SONUS_DB;
var mySQLConnectionString = config.MYSQL_DATABASE_URL;

const CDR_SONUS_CS = new pgp.helpers.ColumnSet(['date_bill','orig_ani','term_ani','start_time','stop_time','duration','duration_use','in_outbound','dom_int_call','orig_carrier_id','term_carrier_id','transit_carrier_id','selected_carrier_id','billing_comp_code','trunk_port','sonus_session_id','sonus_start_time','sonus_disconnect_time','sonus_call_duration','sonus_call_duration_second','sonus_inani','sonus_incallednumber','sonus_ingressprotocolvariant','register_date','sonus_ingrpstntrunkname','sonus_gw','sonus_callstatus','sonus_callingnumber','sonus_egcallednumber','sonus_egrprotovariant'] , {table: 'cdr_sonus'});

const CDR_SONUS_BILLING_CS = new pgp.helpers.ColumnSet(['cdr_id','rate_id','bill_number','bill_date','bleg_call_amount','ips_call_amount','total_amount','remarks'] , {table: 'cdr_sonus_billing'});

const CDR_SONUS_OUTBOUND_CS = new pgp.helpers.ColumnSet(['date_bill','orig_ani','term_ani','start_time','stop_time','duration','duration_use','in_outbound','dom_int_call','orig_carrier_id','term_carrier_id','transit_carrier_id','selected_carrier_id','billing_comp_code','billing_comp_name','trunk_port','sonus_session_id','sonus_start_time','sonus_disconnect_time','sonus_call_duration','sonus_call_duration_second','sonus_inani','sonus_incallednumber','sonus_ingressprotocolvariant','register_date','sonus_ingrpstntrunkname','sonus_gw','sonus_callstatus','sonus_callingnumber','sonus_egcallednumber','sonus_egrprotovariant','landline_amount','mob_amount'] , {table: 'cdr_sonus_outbound'});
    

const CS={'cdr_sonus_cs':CDR_SONUS_CS, 'cdr_sonus_billing_cs':CDR_SONUS_BILLING_CS ,'cdr_sonus_outbound_cs':CDR_SONUS_OUTBOUND_CS};


module.exports = {
  queryBatchInsert: async function(data, cs){
    
    const db_pgp = pgp(config.DATABASE_URL_SONUS_DB);
    const query = pgp.helpers.insert(data, CS[cs]);
    
    let res=await db_pgp.none(query);

   
    return res;
  },
  parserQuery: async function(text,fileName, header,customerName,ipsPortal){

    console.log(text);

    if(ipsPortal){
      connectionString = config.DATABASE_URL_IPS_PORTA;
    }else{
      connectionString = config.DATABASE_URL_SONUS_DB;
    }

    
    try {
      types.setTypeParser(1114, function(stringValue) {
        return stringValue;
       });

       console.log("connectionString="+JSON.stringify(connectionString));
      const pool = await new Pool(connectionString);
      const client = await pool.connect();
      const cursor = client.query(new Cursor(text));
      let data =[];
      
      data = await customPromiseHandler(cursor, numOfRows);

       // adding header manually

       let headerValue = {'start_time': 'Start Time','disconnect_time': 'Disconnect Time','duration_use':'Call Duration (s)','sonus_callingnumber':'Calling Number'
      ,'sonus_egcallednumber':'Called Number','term_carrier_id': 'Carrier Code', 'rate_setup': 'BLEG AC','rate_second':'BLEG Rate','bleg_call_amount':'BLEG Call Amount',
      'ips_call_amount':'IPS Call Amount' ,'total_amount': 'Total Call Amount'};

      let sonusCDROutCusHeader= {'start_time':'Start Time','stop_time':'Disconnect Time','duration_use':'Call Duration (s)','sonus_callingnumber':'Calling Number',
      'sonus_egcallednumber':'Called Number','term_carrier_id':'Carrier Code','mobile_count':'Mobile Calls Count','landline_count':'Landline Calls Count',
      'mobile_duration':'Mobile Duration','landline_duration':'Landline Duration','mob_amount':'Mobile Amount','landline_amount':'Landline Amount',
      'total_amount':'Total Call Amount','total_duration':'Total Duration'};


      if (data.length){
        if(customerName==='Leafnet'){
          data.unshift(headerValue);
        }else{
          data.unshift(sonusCDROutCusHeader);
        }        
      }
      while(data.length){
        util.createCSVWithWriter(fileName, header, data);
        data = await customPromiseHandler(cursor, numOfRows);
      }
      cursor.close(() => {
        client.release()
      });
    } catch (error) {
      console.log("Error !"+error.message);
    }
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
        const pool=mysql.createPool({
          host     : '10.168.11.252',
          user     : 'ipstwo',
          password : 'ipstwo0032',
          database : 'epart',
          timezone: 'Z'
        });
        
        return new Promise(function(resolve, reject) {
          pool.getConnection(function(err, connection){
            if(err) throw err;
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
                connection.release();
              }
            });
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

async function  customPromiseHandler(cursor, numberOfRrecord){

  return new Promise((resolve, reject)=>{

    cursor.read(numberOfRrecord, (err, data)=>{
      
       if(err){
        console.log("err...."+err.message);
        reject(err);
      }
      resolve(data);
    })

  })
 
}




