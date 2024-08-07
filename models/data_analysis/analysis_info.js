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
      sale_price, ips_price, sale_price-ips_price as diff, totol_calls, total_duration
       
         from (select '${year}-${month}' as cdrmonth, customercode, 
      (select customer_name from m_customer where customer_cd=customercode) as customer_name,  terminaltype as calltype , 
      sum(finalcallcharge) as sale_price, sum(vendorcallcharge) as ips_price , count(*) as totol_calls, sum(callduration::int) as total_duration 
      from byokakin_kddi_processedcdr_${year}${month}   group by customercode, terminaltype, cdrmonth) as kddi
      
      UNION ALL
      
      select  'NTT' as carrier, cdrmonth, customercode, customer_name, calltype,
      ( case when calltype='携帯' then (select mobile_rate->>'sale_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='NTT') ELSE
       (case when calltype='固定' then (select fixed_rate->>'sale_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='NTT')
       ELSE (case when calltype='公衆' then (select public_rate->>'sale_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='NTT') end) end) end )
      as sale_rate,
      ( case when calltype='携帯' then (select mobile_rate->>'ips_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='NTT') ELSE
       (case when calltype='固定' then (select fixed_rate->>'ips_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='NTT') ELSE
       (case when calltype='公衆' then (select public_rate->>'ips_rate' from ntt_kddi_rate_c where customer_code=customercode and serv_name='NTT')
       end) end) end )
      as ips_rate,
      sale_price, ips_price, sale_price-ips_price as diff, totol_calls, total_duration
         from (select '${year}-${month}' as cdrmonth, customercode,
      (select customer_name from m_customer where customer_cd=customercode) as customer_name,  terminaltype as calltype ,
      sum(finalcallcharge) as sale_price, sum(vendorcallcharge) as ips_price , count(*) as totol_calls, sum(callduration::int) as total_duration
      from byokakin_ntt_processedcdr_${year}${month}  group by customercode, terminaltype, cdrmonth) as ntt
       order by customercode, carrier ` ;
      const queryByokakinDataPart_1Res = await db.queryByokakin(queryByokakinDataPart_1, []);


      const queryByokakinDataPart_2 = `select carrier, customercode, 'kotehi' as calltype ,  fixed_cost_subtotal as sale_price, 
      to_char(cdrmonth::date, 'YYYY-MM') as cdrmonth from byokakin_billing_history 
      where cdrmonth::date='${year}-${month}-1' and carrier!='NTTORIX' ` ;

      let queryByokakinDataPart_2Res = await db.queryByokakin(queryByokakinDataPart_2, []);

      const queryByokakinDataPart_NTTORIX_2 = `select carrier, customercode, 'kotehi' as calltype ,  fixed_cost_subtotal as sale_price, 
      to_char(cdrmonth::date, 'YYYY-MM') as cdrmonth from byokakin_billing_history 
      where cdrmonth::date='${year}-${month}-1' and carrier='NTTORIX' ` ;

      const queryByokakinDataPart_NTTORIX_2Res = await db.queryByokakin(queryByokakinDataPart_NTTORIX_2, []);

      let queryByokakinDataPartKotehi = queryByokakinDataPart_2Res.rows; 
      let queryByokakinDataPartORIX =  queryByokakinDataPart_NTTORIX_2Res.rows;
      
      queryByokakinDataPartORIX.forEach((obj, index)=>{
        
        let ind = queryByokakinDataPartKotehi.findIndex((ele)=> (ele.carrier=='NTT' && ele.customercode==obj.customercode ) )

        if(ind !== -1) {
          queryByokakinDataPartKotehi[ind] = {...obj, carrier: 'NTT', sale_price: (parseInt(obj.sale_price, 10) + parseInt(queryByokakinDataPartKotehi[ind].sale_price) ) }
        }else{
          queryByokakinDataPartKotehi.push({...queryByokakinDataPartORIX[index], carrier: 'NTT'} )
        }

      })


    //  console.log("queryByokakinDataPart_2Res.."+JSON.stringify(queryByokakinDataPart_2Res));

      const queryNTTKotehiIPS = `select 'NTT' as carrier, comp_acco__c as  customercode, 'kotehi' as calltype, sum(kingaku) as ips_price,
      to_char(datebill::date, 'YYYY-MM') as cdrmonth from ntt_koteihi_cdr  where  (seikyuuuchiwake not ilike '%通話料%' AND 
      seikyuuuchiwake not ilike '%消費税%' AND seikyuuuchiwake not ilike '%割引%' and seikyuuuchiwake not ilike '%料金補正%')  and  
      datebill::date ='${year}-${month}-01' group by comp_acco__c, cdrmonth` ;

      const queryNTTKotehiIPSRes = await db.queryByokakin(queryNTTKotehiIPS, []);
      
      let queryNTTKotehiData = queryByokakinDataPartKotehi.map((obj1)=>(
        {...obj1, ...queryNTTKotehiIPSRes.rows.find((obj2)=>(obj1.carrier==obj2.carrier && obj1.customercode==obj2.customercode))}
      ))


      const queryKDDIKotehiIPS = `select 'KDDI' as carrier, case when lj.comp_acco__c!='' then lj.comp_acco__c else rj.comp_acco__c end as 
      customercode,'kotehi' as calltype, 
      (case when lj.a is null then rj.b else (case when rj.b is null then lj.a else lj.a+rj.b end )end ) as ips_price,  
      '${year}-${month}' as cdrmonth from (select comp_acco__c, sum(amount) as a from (select * from (select comp_acco__c, amount, 
       (select data_name from kddi_kotehi_a_service_details where data_code=gendetaildesc limit 1) as  gendetaildesc_name, datebill  
       from kddi_kotei_cdr_contents where  to_char(datebill::date, 'MM-YYYY')='${month}-${year}' ) as foo  where foo.gendetaildesc_name 
       not ilike '%通話料%') as res group by comp_acco__c ) as lj full join (select sum(amount) as b,  comp_acco__c from (select * from 
      (select comp_acco__c, amount, (select data_name from kddi_kotehi_a_basic_construct where data_code=basicchargedesc limit 1) as  basicchargedesc_name, 
      datebill  from kddi_kotei_cdr_basic where  to_char(datebill::date, 'MM-YYYY')='${month}-${year}' ) as foo where foo.basicchargedesc_name not ilike
       '%通話料%')  as res group by comp_acco__c) as rj on (lj.comp_acco__c= rj.comp_acco__c)`;

       const queryKDDIKotehiIPSRes = await db.queryByokakin(queryKDDIKotehiIPS, []);

       queryNTTKotehiData = queryNTTKotehiData.map((obj1)=>(
        {...obj1, ...queryKDDIKotehiIPSRes.rows.find((obj2)=>(obj1.customercode==obj2.customercode && obj1.carrier==obj2.carrier && obj1.calltype == obj2.calltype ))}
       ))

      const querySonusOutboundLandlineData = `select 'IPSP' as carrier , customer_id as customercode, 
      billing_year || '-' ||  billing_month as cdrmonth,
       '固定' as calltype,  landline_amt as sale_price, 
      landline_duration as total_duration , landline_count as totol_calls from cdr_sonus_outbound_summary       
      where billing_date::date = '${year}-${month}-1'` ;

      const querySonusOutboundLandlineDataRes = await db.query(querySonusOutboundLandlineData, []);

      const querySonusOutboundMobileData = `select 'IPSP' as carrier , customer_id as customercode, 
      billing_year || '-' ||  billing_month as cdrmonth, '携帯' as calltype,  mobile_amt as sale_price, 
      mobile_duration as total_duration , mobile_count as totol_calls from  cdr_sonus_outbound_summary       
      where billing_date::date = '${year}-${month}-1'` ;

      const querySonusOutboundMobileDataRes = await db.query(querySonusOutboundMobileData, []);

      const sonusOutboundKotehi = `select 'IPSP' as  carrier , sum(amount) as sale_price, 'kotehi' as  calltype , 
          comp_acco__c as customercode, '${year}-${month}' as cdrmonth from ips_kotehi_cdr_bill
          where to_char(datebill::date, 'MM-YYYY')='${month}-${year}'
          group by comp_acco__c, companyname`
      
      const sonusOutboundKotehiRes = await db.queryByokakin(sonusOutboundKotehi, []);


      const getNumberOfChannelSonusOutboundQuery = `select 'IPSP' as  carrier , ceil(sum(amount)/1200.0) as number_of_channel,
       'kotehi' as  calltype , comp_acco__c as customercode, '${year}-${month}' as cdrmonth from ips_kotehi_cdr_bill
      where to_char(datebill::date, 'MM-YYYY')='${month}-${year}'  and ips_product_name in ('チャネル利用料')
      group by comp_acco__c order by comp_acco__c`;

      const getNumberOfChannelSonusOutboundRes = await db.queryByokakin(getNumberOfChannelSonusOutboundQuery, []);

      const getNumberOfChannelKDDIQuery = `select 'KDDI' as  carrier , ceil(sum(amount)/1200.0) as number_of_channel,
       'kotehi' as  calltype , '0000' || substring(split_part(bill_numb__c, '-',2),4) as customercode, '${year}-${month}' as cdrmonth 
       from kddi_kotei_bill_details  where to_char(bill_start__c::date, 'MM-YYYY')='${month}-${year}'  and productname in
       ('追加ｃｈ基本料','追加チャネル利用料','月額利用料')
      group by '0000' || substring(split_part(bill_numb__c, '-',2),4) order by  '0000' ||substring(split_part(bill_numb__c, '-',2),4)`;

      const getNumberOfChannelSonusKDDIRes = await db.queryByokakin(getNumberOfChannelKDDIQuery, []);

      const getNumberOfChannelNTTQuery = `select 'NTT' as  carrier , ceil(sum(kingaku)/1200.0) as number_of_channel,
       'kotehi' as  calltype , comp_acco__c as customercode, '${year}-${month}' as cdrmonth from ntt_koteihi_cdr_bill
      where to_char(datebill::date, 'MM-YYYY') = '${month}-${year}'  and seikyuuuchiwake in 
      ('ＩＰＶ　アクセスセット基本料','ＩＰＶアクセスセット基本料','IPV　アクセスセット基本料','IPV アクセスセット基本料','チャネル追加利用料','ch基本料','ch追加基本料','チャネル利用料',
      '基本利用料','チャネル基本利用料','チャネル基本料金','追加ch利用料','基本料金')
      group by comp_acco__c order by comp_acco__c`;

      const getNumberOfChannelNTTRes = await db.queryByokakin(getNumberOfChannelNTTQuery, []);




      const res1 = queryByokakinDataPart_1Res.rows;
      const res2 = queryNTTKotehiData;
      const res3 = querySonusOutboundLandlineDataRes.rows;
      const res4 = querySonusOutboundMobileDataRes.rows;
      const res5 = sonusOutboundKotehiRes.rows;


     
      const res6 = getNumberOfChannelSonusOutboundRes.rows;
      const res7 = getNumberOfChannelSonusKDDIRes.rows;
      const res8 = getNumberOfChannelNTTRes.rows;

      
      Array.prototype.push.apply(res1, res2);
      Array.prototype.push.apply(res1, res3);
      Array.prototype.push.apply(res1, res4);
      Array.prototype.push.apply(res1, res5);



      res6.forEach((obj)=>{
        let ind = res1.findIndex((ele)=> (ele.customercode == obj.customercode && ele.carrier == obj.carrier && ele.calltype== obj.calltype)) ;
        if(ind !== -1 ){
          res1[ind] = {...res1[ind], number_of_channel: obj.number_of_channel };
        }
      })

      res7.forEach((obj)=>{
        let ind = res1.findIndex((ele)=> (ele.customercode == obj.customercode && ele.carrier == obj.carrier && ele.calltype== obj.calltype)) ;
        if(ind !== -1 ){
          res1[ind] = {...res1[ind], number_of_channel: obj.number_of_channel };
        }
      })

      res8.forEach((obj)=>{
        let ind = res1.findIndex((ele)=> (ele.customercode == obj.customercode && ele.carrier == obj.carrier && ele.calltype== obj.calltype)) ;
        if(ind !== -1 ){
          res1[ind] = {...res1[ind], number_of_channel: obj.number_of_channel };
        }
      })



      // Array.prototype.push.apply(res1, res6);
      // Array.prototype.push.apply(res1, res7);
      // Array.prototype.push.apply(res1, res8);

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


