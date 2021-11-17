var db = require('../../config/database');

module.exports = {
    getInvoiceData: async function() {
      try {
          return {'message':'success','path':'\\ws35\国内通信\通信事業部\NewBillingSystem\Leafnet'};
          
      } catch (error) {
          return error;
      }
  },
  getAllMVNOCustomer: async function() {
    try {
          const query=`select * from mvno_customer where deleted =false`;
          const getAllMVNOCustRes= await db.queryIBS(query,[]);

          if(getAllMVNOCustRes.rows){
              return  getAllMVNOCustRes.rows;
          }
          return {err:'not found'};
      } catch (error) {
          console.log("Err "+ error.message);
          return error;
      }
  },
  getTargetDate: async function(date_id) {
    try {
          const query=`SELECT max(date_set)::date - interval '1 month' as target_billing_month, max(date_set)::date as current_montth FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
          const targetDateRes= await db.query(query,[]);
          //console.log(targetDateRes);
          if(targetDateRes.rows){
              return  {'target_billing_month' : (targetDateRes.rows[0].target_billing_month),'current_montth':(targetDateRes.rows[0].current_montth)} ;              
          }
          return {err:'not found'};
      } catch (error) {
          return error;
      }
  },
  createCDR: async function(customer_name, customer_id, year , month, leg, did){
    let resChunkArr=[], fileName ='';
    if(leg){
        fileName = __dirname+`\\CDR\\${customer_name}${leg}CDR${year}${month}.csv`;
    }else{
        fileName = __dirname+`\\CDR\\${customer_name}${did}CDR${year}${month}.csv`;
    }
    

    let header =  [
        {id: 'start_time', title: '通話開始時間'},{id: 'stop_time', title: '通話終了時間'}, {id: 'duration', title: '通話時間（秒）'}, 
        {id: 'sonus_callstatus', title: '呼STATUS'}, {id: 'sonus_callingnumber', title: '発信元番号'},
        {id: 'sonus_egcallednumber', title: '発信先番号'}, {id: 'c_type', title: '端末'}
    ]


    //SELECT ADDTIME(STARTTIME,'09:00:00') AS STARTCALL, ADDTIME(DISCONNECTTIME,'09:00:00') AS STOPCALL, CALLDURATION*0.01 AS DURATIONKIRIAGE,
    //CALLSTATUS,CALLINGNUMBER,EGCALLEDNUMBER,case when( LEFT (EGCALLEDNUMBER,2)=70 || LEFT (EGCALLEDNUMBER,2)=80 || LEFT (EGCALLEDNUMBER,2)=90)
    // then '携帯' else '固定' end as c_type

    try{
        let query=`select leg, start_time, stop_time, duration , orig_ani, term_ani, orig_carrier_id, setup_rate, call_rate, freq_rate, call_charge
        from cdr_fphone where leg='${leg}' and to_char(start_time, 'MM-YYYY') = '${month}-${year}' and company_code='${customer_id}' 
        order by start_time asc `;
         
        resArr = await db.queryIBS(query,[]);

        
    }catch(err){
        console.log("Error in creating CDR =="+err.message);
    }

  }, 
  
}


