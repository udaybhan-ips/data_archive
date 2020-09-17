var config = require('./../../config/config');
var db = require('./../../config/database');

module.exports = {
  getSummaryData: async function(serviceId, targetMonth) {
      try {
          const query=`select * from sonus_outbound_summary where service_id='${serviceId}' and summary_date::date >= ${targetMonth} and  `;
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
        const query=`SELECT * from CDR_SONUS ` ;
        const data= await db.query(query);
        return data.rows;
    } catch (error) {
        return error;
    }
},

  create: async function(data, ratesData) {
      const ipsRates = await getRates('00000130','',ratesData);
      for(let i=0;i < data.length;i++){

        const query=`INSERT INTO cdr_sonus_billing( cdr_id, rate_id, bill_number, bill_date, bleg_call_amount, ips_call_amount, remarks ) VALUES ($1, $2, $3, $4, $5, $6, $7) returning cdr_id`;
                let valueArray=[];
                
                const rates = await getRates( data[i]['billing_comp_code'], data[i]['term_carrier_id'] , ratesData);
                const blegCallAmount = parseFloat(rates['rateSetup'],10) + ( parseInt(data[i]['duration'],10) * parseFloat(rates['rateSecond'],10));
                const ipsCallAmount = parseFloat(ipsRates['rateSetup'],10) + ( parseInt(data[i]['duration'],10) * parseFloat(ipsRates['rateSecond'],10));
                const totalCallAmount = ipsCallAmount + blegCallAmount ;
                
                valueArray.push(data[i]['cdr_id']);
                valueArray.push(rates['rateId']);
                valueArray.push(1);
                valueArray.push('now()');
                valueArray.push(blegCallAmount);
                valueArray.push(ipsCallAmount);
                valueArray.push(totalCallAmount);
                const res = await db.query(query,valueArray);
          }
            return res.rows[0];    
  },
  
}


async function  getRates(companyCode, carrierCode, ratesData){
    let resData=[];
        for (let i=0; i < ratesData.length; i++){
            if(carrierCode && companyCode) {  
                if( ratesData[i]['carrier_code'] == carrierCode &&  ratesData[i]['company_code'] == companyCode){
                    
                    resData['rateId'] = ratesData[i]['rate_id'];
                    resData['rateSetup'] = ratesData[i]['rate_setup'];
                    resData['rateSecond'] = ratesData[i]['rate_second'];
                    return resData;
                 }
            }else if(companyCode){
                if(ratesData[i]['company_code'] == companyCode){
                    
                    resData['rateId'] = ratesData[i]['rate_id'];
                    resData['rateSetup'] = ratesData[i]['rate_setup'];
                    resData['rateSecond'] = ratesData[i]['rate_second'];
                    return resData;
                 }
            }
        }
  return resData;
}
