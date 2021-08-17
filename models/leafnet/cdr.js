var db = require('../../config/database');

module.exports = {
    getInvoiceData: async function() {
      try {
          return {'message':'success','path':'\\ws35\国内通信\通信事業部\NewBillingSystem\Leafnet'};
          
      } catch (error) {
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
  createCDR: async function(year , month){
    let resChunkArr=[];
    
    let fileName = __dirname+`\\CDR\\LeafnetCDR${year}${month}.csv`;

    let header =  [
        {id: 'start_time', title: 'Start Time'},{id: 'disconnect_time', title: 'Disconnect Time'}, {id: 'duration_use', title: 'Call Duration (s)'}, 
        {id: 'sonus_callingnumber', title: 'Calling Number'}, {id: 'sonus_egcallednumber', title: 'Called Number'},{id: 'term_carrier_id', title: 'Carrier Code'}, 
        {id: 'rate_setup', title: 'BLEG AC'}, {id: 'rate_second', title: 'BLEG Rate'},{id: 'bleg_call_amount', title: 'BLEG Call Amount'},
        {id: 'ips_call_amount', title: 'IPS Call Amount'},{id: 'total_amount', title: 'Total Call Amount'}
    ]

    try{
        let query=`select b.start_time, b.stop_time, b.Duration_Use , b.SONUS_CALLINGNUMBER, b.SONUS_EGCALLEDNUMBER,b.Term_Carrier_ID, 
        c.Rate_Setup, c.Rate_Second, a.BLEG_Call_amount , a.IPS_Call_amount, a.Total_amount  from CDR_SONUS_BILLING a, CDR_SONUS b,
         CDR_SONUS_RATE c where to_char(b.start_time, 'MM-YYYY') = '${month}-${year}' and a.CDR_ID = b.CDR_ID and a.Rate_ID = c.Rate_ID 
         order by b.START_TIME `;

         console.log("query="+query);
         
        resChunkArr = await db.parserQuery(query, fileName, header,'Leafnet');

        console.log("chunk array length=="+resChunkArr.length)
    }catch(err){
        console.log("Error in creating CDR =="+err.message);
    }

  }, 
  
}


