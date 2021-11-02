var db = require('../../config/database');

module.exports = {
    getInvoiceData: async function() {
      try {
          return {'message':'success','path':'\\ws35\国内通信\通信事業部\NewBillingSystem\Leafnet'};
          
      } catch (error) {
          return error;
      }
  },
  getAllSonusOutboundCustomer: async function() {
    try {
          const query=`select  customer_name, customer_id   from sonus_outbound_customer where customer_name!='Wiz' and deleted=false group by customer_name, customer_id order by customer_id`;
          const ipsPortal=true;
          const getAllSonusOutboundCustRes= await db.query(query,[],ipsPortal);
          if(getAllSonusOutboundCustRes.rows){
              return  getAllSonusOutboundCustRes.rows;
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
  createCDR: async function(customer_name, customer_id, year , month){
    let resChunkArr=[];
   
    let fileName = __dirname+`\\CDR\\${customer_name}CDR${year}${month}.csv`;

    let header =  [
        {id: 'start_time', title: '通話開始時間'},{id: 'stop_time', title: '通話終了時間'}, {id: 'duration', title: '通話時間（秒）'}, 
        {id: 'sonus_callstatus', title: '呼STATUS'}, {id: 'sonus_callingnumber', title: '発信元番号'},
        {id: 'sonus_egcallednumber', title: '発信先番号'}, {id: 'c_type', title: '端末'}
    ]


    //SELECT ADDTIME(STARTTIME,'09:00:00') AS STARTCALL, ADDTIME(DISCONNECTTIME,'09:00:00') AS STOPCALL, CALLDURATION*0.01 AS DURATIONKIRIAGE,
    //CALLSTATUS,CALLINGNUMBER,EGCALLEDNUMBER,case when( LEFT (EGCALLEDNUMBER,2)=70 || LEFT (EGCALLEDNUMBER,2)=80 || LEFT (EGCALLEDNUMBER,2)=90)
    // then '携帯' else '固定' end as c_type

    try{
        let query=`select start_time, stop_time, duration , sonus_callstatus, sonus_callingnumber, sonus_egcallednumber, 
        case when ( left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR left(sonus_egcallednumber,2)='90' ) then 'mobile' else 'landline' end as c_type
        from cdr_sonus_outbound where duration > 0 and to_char(start_time, 'MM-YYYY') = '${month}-${year}' and billing_comp_code='${customer_id}' and billing_comp_name='${customer_name}' order by start_time asc `;
         
        resChunkArr = await db.parserQuery(query, fileName, header,customer_name);

        console.log("chunk array length=="+resChunkArr.length)
    }catch(err){
        console.log("Error in creating CDR =="+err.message);
    }

  }, 
  
}


