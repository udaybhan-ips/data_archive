var db = require('../../config/database');
var utility = require('./../../public/javascripts/utility');

const compare = (a, b) => {
  if (a.customercode > b.customercode) {
    return 1;
  } else if (a.customercode < b.customercode) {
    return -1;
  } else if (a.carrier > b.carrier) {
    return 1;
  } else if (a.carrier < b.carrier) {
    return -1;
  } else {
    return 0;
  }
}


module.exports = {
  getAnalysisInfo: async function ({year, month}) {

    //console.log("req data is.."+JSON.stringify());

    let res = [];

    try {
      const queryByokakinDataPart_1 = `select  'KDDI' as carrier, cdrmonth, customercode, customer_name, calltype, 
      ( case when calltype='携帯' then (select mobile_rate->>'sale_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='KDDI') ELSE
       (case when calltype='固定' then (select fixed_rate->>'sale_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='KDDI') 
       ELSE (case when calltype='公衆' then (select public_rate->>'sale_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='KDDI') end) end) end ) 
      as sale_rate, 
      ( case when calltype='携帯' then (select mobile_rate->>'ips_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='KDDI') ELSE
       (case when calltype='固定' then (select fixed_rate->>'ips_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='KDDI') ELSE
       (case when calltype='公衆' then (select public_rate->>'ips_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='KDDI') 
       end) end) end ) 
      as ips_rate, 
      sale_price, ips_price, sale_price-ips_price as diff, totol_calls, total_duration,
       callchargebykddi
         from (select '2023-03' as cdrmonth, customercode, 
      (select customer_name from m_customer where customer_cd=customercode) as customer_name,  terminaltype as calltype , 
      sum(finalcallcharge) as sale_price, sum(vendorcallcharge) as ips_price , count(*) as totol_calls, sum(callduration::int) as total_duration, sum(cdrcallcharge) as callchargebykddi 
      from byokakin_kddi_processedcdr_${year}${month}   group by customercode, terminaltype, cdrmonth) as kddi
      
      UNION ALL
      
      select  carriertype as carrier, cdrmonth, customercode, customer_name, calltype,
      ( case when calltype='携帯' then (select mobile_rate->>'sale_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='NTT') ELSE
       (case when calltype='固定' then (select fixed_rate->>'sale_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='NTT')
       ELSE (case when calltype='公衆' then (select public_rate->>'sale_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='NTT') end) end) end )
      as sale_rate,
      ( case when calltype='携帯' then (select mobile_rate->>'ips_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='NTT') ELSE
       (case when calltype='固定' then (select fixed_rate->>'ips_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='NTT') ELSE
       (case when calltype='公衆' then (select public_rate->>'ips_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='NTT')
       end) end) end )
      as ips_rate,
      sale_price, ips_price, sale_price-ips_price as diff, totol_calls, total_duration,  callchargebyntt
         from (select '2023-03' as cdrmonth, customercode,
      (select customer_name from m_customer where customer_cd=customercode) as customer_name,  terminaltype as calltype ,
      sum(finalcallcharge) as sale_price, sum(vendorcallcharge) as ips_price , count(*) as totol_calls, sum(callduration::int) as total_duration, sum(cdrcallcharge) as callchargebyntt, carriertype
      from byokakin_ntt_processedcdr_${year}${month}  group by customercode,carriertype, terminaltype, cdrmonth) as ntt
       order by customercode, carrier ` ;


      const queryByokakinDataPart_1Res = await db.queryByokakin(queryByokakinDataPart_1, []);

      const queryByokakinDataPart_2 = `select carrier, customercode, 'kotehi' as calltype ,  fixed_cost_subtotal as sale_price, 
      to_char(cdrmonth::date, 'YYYY-MM') as cdrmonth from byokakin_billing_history 
      where cdrmonth::date='${year}-${month}-1' ` ;

      const queryByokakinDataPart_2Res = await db.queryByokakin(queryByokakinDataPart_2, []);

      const querySonusOutboundLandlineData = `select 'SonusOutbound' as carrier , customer_id as customercode, 
      billing_year || '-' ||  billing_month as cdrmonth,
       'landline_data' as calltype,  landline_amt as sale_price, 
      landline_duration as total_duration , landline_count as totol_calls from cdr_sonus_outbound_summary       
      where billing_date::date = '${year}-${month}-1'` ;

      const querySonusOutboundLandlineDataRes = await db.query(querySonusOutboundLandlineData, []);

      const querySonusOutboundMobileData = `select 'SonusOutbound' as carrier , customer_id as customercode, 
      billing_year || '-' ||  billing_month as cdrmonth,
      'mobile_data' as calltype,  mobile_amt as sale_price, 
      mobile_duration as total_duration , mobile_count as totol_calls     from  cdr_sonus_outbound_summary       
      where billing_date::date = '${year}-${month}-1'` ;

      const querySonusOutboundMobileDataRes = await db.query(querySonusOutboundMobileData, []);

      const sonusOutboundKotehi = `select 'SonusOutbound' as  carrier , sum(amount) as sale_price, 'kotehi' as  calltype , 
          comp_acco__c as customercode, to_char(datebill::date, 'YYYY-MM') as cdrmonth from ips_kotehi_cdr_bill
          where to_char(datebill::date, 'MM-YYYY')='${month}-${year}'
          group by comp_acco__c, companyname`
      
      const sonusOutboundKotehiRes = await db.queryByokakin(sonusOutboundKotehi, []);

      const res1 = queryByokakinDataPart_1Res.rows;
      const res2 = queryByokakinDataPart_2Res.rows;
      const res3 = querySonusOutboundLandlineDataRes.rows;
      const res4 = querySonusOutboundMobileDataRes.rows;
      const res5 = sonusOutboundKotehiRes.rows;


      Array.prototype.push.apply(res1, res2);
      Array.prototype.push.apply(res1, res3);
      Array.prototype.push.apply(res1, res4);
      Array.prototype.push.apply(res1, res5);

  
      //console.log("Ress..."+JSON.stringify(res1))

      res1.sort(compare)

      
  

      return res1;

      // if (summaryRes.rows) {
      //   return (summaryRes.rows);
      // }

      

    } catch (error) {
      console.log("error in getting analysis info !" + error.message)
      throw new Error(error.message)
    }
  },
  
}


