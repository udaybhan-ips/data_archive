var config = require('./../../config/config');
var db = require('./../../config/database');
const  BATCH_SIZE  = 1000000;
const CDR_SONUS_BILLING_CS='cdr_sonus_billing_cs';

module.exports = {
  getRates: async function() {
      try {
          const query=`select * from cdr_sonus_rate where currnet_flag=1 `;
          const ratesRes= await db.query(query,[]);
          
          if(ratesRes.rows){
              return (ratesRes.rows);              
          }
          return {err:'not found'};
      } catch (error) {
          return error;
      }
  },
  
getTargetCDR: async function(targetDate) {
    
    try {
        const query=`SELECT billing_comp_code, term_carrier_id, duration, cdr_id  from CDR_SONUS ` ;
        const data= await db.query(query);
        return data.rows;
    } catch (error) {
        return error;
    }
}, 
insertByBatches: async function(records, ratesData) {

    console.log("start inserting....");

    let res=[];
    let resArr=[];
    let ipsRates, JSON_data, chunkArray;
    try{
        ipsRates = await getRates('00000130','',ratesData);

        //console.log("IPS rates"+ipsRates);
       // console.log("IPS rates Id=="+(ipsRates['rateId']));

        JSON_data = Object.values(JSON.parse(JSON.stringify(records)));
        chunkArray=chunk(JSON_data,BATCH_SIZE);
    
        for(let i=0;i<chunkArray.length;i++){
            const data = await getNextInsertBatch(chunkArray[i], ipsRates, ratesData);
            res=await db.queryBatchInsert(data,CDR_SONUS_BILLING_CS);
            resArr.push(res);
        }
    }catch(err){
        console.log("Error: "+err.message);
    }
    
    console.log("done"+ new Date());
    console.log(resArr);
    return resArr;

 },  
}


async function  getRates(companyCode, carrierCode, ratesData){

    let resData=[];
   // console.log("company code="+companyCode);
   // console.log("carrierCode="+carrierCode);
    try{
        for (let i=0; i < ratesData.length; i++){
            if(carrierCode && companyCode) {  
                if( ratesData[i]['carrier_code'] == carrierCode &&  ratesData[i]['company_code'] == companyCode){
                    
                    resData['rateId'] = ratesData[i]['rate_id'];
                    resData['rateSetup'] = ratesData[i]['rate_setup'];
                    resData['rateSecond'] = ratesData[i]['rate_second'];
                    break;
                    //return resData;
                 }
            }else if(companyCode){
               // console.log("1")
                if(ratesData[i]['company_code'] == companyCode){
                 //   console.log("2")
                    resData['rateId'] = ratesData[i]['rate_id'];
                    resData['rateSetup'] = ratesData[i]['rate_setup'];
                    resData['rateSecond'] = ratesData[i]['rate_second'];
                   // console.log("in side loop res data="+JSON.stringify(resData));            
                    break;
                    //return resData;
                 }
            }
        }
    }catch(err){
        console.log("Error "+err.message);
    }
    
    //console.log("res data="+JSON.stringify(resData));
  return resData;
}





async function getNextInsertBatch(data, ipsRates, ratesData) {
    
    let valueArray=[];

   // console.log("data=="+JSON.stringify(data))
   // console.log("ipsRates=="+JSON.stringify(ipsRates))
   // console.log("ratesData=="+JSON.stringify(ratesData))

    try {
     for(let i=0;i<data.length;i++){
       
       let obj={};
       const rates = await getRates( data[i]['billing_comp_code'], data[i]['term_carrier_id'] , ratesData);

     //  console.log("rates=="+(rates));
       //console.log("rates Id=="+(rates['rateId']));

       const blegCallAmount = parseFloat(rates['rateSetup'],10) + ( parseInt(data[i]['duration'],10) * parseFloat(rates['rateSecond'],10));
       const ipsCallAmount = parseFloat(ipsRates['rateSetup'],10) + ( parseInt(data[i]['duration'],10) * parseFloat(ipsRates['rateSecond'],10));
       const totalCallAmount = ipsCallAmount + blegCallAmount ;
       obj['cdr_id']=data[i]['cdr_id'];
       obj['rate_id']=rates['rateId'];
       obj['bill_number']='1';
       obj['bill_date']='now()';
       obj['bleg_call_amount']=blegCallAmount;
       obj['ips_call_amount']=ipsCallAmount;
       obj['total_amount']=totalCallAmount;
       obj['remarks']='re';
       
       if(rates['rateId']==null || rates['rateId']=='' || rates['rateId']=='null'){
            console.log(JSON.stringify(data[i]));

       }

       valueArray.push(obj);
       
     }
    }catch(err){
      console.log("err"+err.message);
     }
    //console.log("actual data=="+JSON.stringify(valueArray))
    return valueArray;

  }


function chunk(array, size) {

   // console.log("chunk"+size);
  
    const chunked_arr = [];
    let copied = [...array]; // ES6 destructuring
    const numOfChild = Math.ceil(copied.length / size); // Round up to the nearest integer
    for (let i = 0; i < numOfChild; i++) {
      chunked_arr.push(copied.splice(0, size));
    }
    return chunked_arr;
}
