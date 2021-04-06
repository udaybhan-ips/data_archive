var db = require('../../config/database');

module.exports = {
    getInvoiceData: async function() {
      try {
          return {'message':'success','path':'\\ws35\国内通信\通信事業部\NewBillingSystem\Leafnet'};
          
      } catch (error) {
          return error;
      }
  },

  createCDR: async function(){
    let resChunkArr=[];
    let year ='2021', month ='02';
    let fileName = __dirname+`\\CDR\\LeafnetCDR${year}${month}.csv`;

    let header =  [
        {id: 'start_time', title: 'Start Time'},{id: 'disconnect_time', title: 'Disconnect Time'}, {id: 'duration_use', title: 'Call Duration (s)'}, 
        {id: 'sonus_callingnumber', title: 'Calling Number'}, {id: 'sonus_egcallednumber', title: 'Called Number'},{id: 'term_carrier_id', title: 'Carrier Code'}, 
        {id: 'rate_setup', title: 'BLEG AC'}, {id: 'rate_second', title: 'BLEG Rate'},{id: 'bleg_call_amount', title: 'BLEG Call Amount'},
        {id: 'ips_call_amount', title: 'IPS Call Amount'},{id: 'total_amount', title: 'Total Call Amount'}
    ]

    try{
        let query=`select b.SONUS_START_TIME as start_time, b.SONUS_DISCONNECT_TIME as disconnect_time, b.Duration_Use , b.SONUS_CALLINGNUMBER, b.SONUS_EGCALLEDNUMBER,b.Term_Carrier_ID, c.Rate_Setup, c.Rate_Second, a.BLEG_Call_amount , a.IPS_Call_amount, a.Total_amount  from CDR_SONUS_BILLING a, CDR_SONUS b, CDR_SONUS_RATE c where a.CDR_ID = b.CDR_ID and a.Rate_ID = c.Rate_ID order by b.SONUS_START_TIME `;
         
        resChunkArr = await db.parserQuery(query, fileName, header);

        console.log("chunk array length=="+resChunkArr.length)
    }catch(err){
        console.log("Error in creating CDR =="+err.message);
    }

  },

 
  
}


