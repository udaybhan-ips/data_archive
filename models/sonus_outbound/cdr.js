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
          const query=`select  customer_name, customer_id   from sonus_outbound_customer group by customer_name, customer_id order by customer_id`;
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
        {id: 'start_time', title: 'Start Time'},{id: 'stop_time', title: 'Disconnect Time'}, {id: 'duration_use', title: 'Call Duration (s)'}, 
        {id: 'sonus_callingnumber', title: 'Calling Number'}, {id: 'sonus_egcallednumber', title: 'Called Number'},
        {id: 'term_carrier_id', title: 'Carrier Code'}, {id: 'mobile_count', title: 'Mobile Calls Count'},
        {id: 'landline_count', title: 'Landline Calls Count'},{id: 'mobile_duration', title: 'Mobile Duration'},
        {id: 'landline_duration', title: 'Landline Duration'},{id:'mob_amount',title:'Mobile Amount'},
        {id:'landline_amount',title:'Landline Amount'}, {id: 'total_amount', title: 'Total Call Amount'},
        {id: 'total_duration', title: 'Total Duration'}
    ]

    try{
        let query=`select start_time, stop_time, duration_use , sonus_callingnumber, sonus_egcallednumber, term_carrier_id,
        case when ( left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR left(sonus_egcallednumber,2)='90' ) then 1 else 0 end as mobile_count,
        case when ( left(sonus_egcallednumber,2)='70' OR  left(sonus_egcallednumber,2)='80' OR left(sonus_egcallednumber,2)='90' ) then 0 else 1 end as landline_count,
        case when ( left(sonus_egcallednumber,2)='70' OR  left(sonus_egcallednumber,2)='80' OR left(sonus_egcallednumber,2)='90' ) then duration else 0 end as mobile_duration,
        case when ( left(sonus_egcallednumber,2)='70' OR  left(sonus_egcallednumber,2)='80' OR left(sonus_egcallednumber,2)='90' ) then 0 else duration end as landline_duration,
        case when ( left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR left(sonus_egcallednumber,2)='90' ) then duration*0.115 else 0 end as mob_amount,
        case when ( left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR left(sonus_egcallednumber,2)='90' ) then 0 else duration*0.06 end as landline_amount,
        case when ( left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR left(sonus_egcallednumber,2)='90' ) then duration*0.115 else duration*0.06 end as total_amount,
        duration as total_duration
        from cdr_sonus_outbound where to_char(start_time, 'MM-YYYY') = '${month}-${year}' and billing_comp_code='${customer_id}' and billing_comp_name='${customer_name}' `;
         
        resChunkArr = await db.parserQuery(query, fileName, header,customer_name);

        console.log("chunk array length=="+resChunkArr.length)
    }catch(err){
        console.log("Error in creating CDR =="+err.message);
    }

  }, 
  
}


