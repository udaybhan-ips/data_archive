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

const CDR_CS = new pgp.helpers.ColumnSet(['date_bill','orig_ani','term_ani','start_time','stop_time','duration','duration_use','in_outbound','dom_int_call','orig_carrier_id','term_carrier_id','transit_carrier_id','selected_carrier_id','billing_company_code','trunk_port','sonus_session_id','sonus_start_time','sonus_disconnect_time','sonus_call_duration','sonus_call_duration_second','sonus_anani','sonus_incallednumber','sonus_ingressprotocolvariant','registerdate','sonus_ingrpstntrunkname','sonus_gw','sonus_callstatus','sonus_callingnumber'] , {table: 'cdr_202107'});
const BILLCDR_CS = new pgp.helpers.ColumnSet(['cdr_id','date_bill','company_code','carrier_code','in_outbound','trunk_port_target'
,'duration','start_time','stop_time','orig_ani','term_ani','route_info','date_update','orig_carrier_id','term_carrier_id',
'transit_carrier_id','selected_carrier_id','trunk_port_name','gw','session_id','call_status','kick_company','term_use'] , {table: 'billcdr_main'});



const CS={'cdr_sonus_cs':CDR_SONUS_CS, 'billcdr_cs':BILLCDR_CS, 'cdr_cs':CDR_CS , 'cdr_sonus_billing_cs':CDR_SONUS_BILLING_CS ,'cdr_sonus_outbound_cs':CDR_SONUS_OUTBOUND_CS};


module.exports = {
  queryBatchInsert: async function(data, cdr_cs){
    
    console.log("data length="+data.length);
    console.log("cs="+cdr_cs);
    let db_pgp,query,res;
    try{
     if(cdr_cs=='billcdr_cs'){
      db_pgp = pgp(config.DATABASE_URL_IBS);
     } else{
      db_pgp = pgp(config.DATABASE_URL_SONUS_DB);
     }
    
    
     query = pgp.helpers.insert(data, CS[cdr_cs]);
   
      res=await db_pgp.none(query)
    }catch(e){
      console.log("www-"+e.message)
    }
    

   console.log("3")
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

     // {id: 'start_time', title: '通話開始時間'},{id: 'stop_time', title: '通話終了時間'}, {id: 'duration', title: '通話時間（秒）'}, 
      //{id: 'sonus_callstatus', title: '呼STATUS'}, {id: 'sonus_callingnumber', title: '発信元番号'},
      //{id: 'sonus_egcallednumber', title: '発信先番号'}, {id: 'c_type', title: '端末'}

      let sonusCDROutCusHeader= {'start_time':'通話開始時間','stop_time':'通話終了時間','duration':'通話時間（秒）','sonus_callstatus':'呼STATUS',
      'sonus_callingnumber':'発信元番号','sonus_egcallednumber':'発信先番号','c_type':'端末'};
      //let sonusCDROutCusHeader= {'start_time':'start_time','stop_time':'stop_time','duration':'duration','sonus_callstatus':'sonus_callstatus',
      //sonus_callingnumber':'sonus_callingnumber','sonus_egcallednumber':'sonus_egcallednumber','c_type':'c_type'};


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
      queryIBS: async function(text, values) {
       // console.log("query="+text+"----"+values);
           try{
             types.setTypeParser(1114, function(stringValue) {
               return stringValue;
              })
              let connectionStringIBS = config.DATABASE_URL_IBS;
             
              const pool = await new Pool(connectionStringIBS)
              const res = await pool.query(text,values);
             // console.log("data==="+JSON.stringify(res));
              return (res);
           }catch(err){
              
              console.log("Error while quering" +err.message)
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
          //timezone: 'Z'
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




