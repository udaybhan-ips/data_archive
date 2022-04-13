var db = require('./../../../config/database');
const BATCH_SIZE = 1000000;

let ColumnSetKDDIProcessedData = ['cdrid', 'cdrclassification', 'customercode', 'terminaltype', 'freedialnumber', 'callingnumber', 'calldate',
  'calltime', 'callduration', 'cld', 'sourcearea', 'destinationarea', 'cdrcallcharge', 'callrate', 'finalcallcharge', 'vendorcallcharge'];



module.exports = {
  getRates: async function (customer_id) {
    try {
      const query = `select  * from ntt_kddi_charge_c where customercode__c::int ='${customer_id}'  and edat_fini__c::date >  now()::date 
       and serv_name__c ='KDDI' and dist_rang_from__c='0' and dist_rang_to__c ='0' `;

      const ratesRes = await db.queryByokakin(query, []);
      if (ratesRes.rows) {
        return (ratesRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get rates =" + error.message);
      return error;
    }
  },

  getInboundRates: async function (customer_id) {
    try {
      const query = `select  * from ntt_kddi_charge_inbound_c where customercode__c::int ='${customer_id}'  and edat_fini__c::date >  now()::date 
       and serv_name__c ='KDDI' and dist_rang_from__c='0' and dist_rang_to__c ='0' `;

      const ratesRes = await db.queryByokakin(query, []);
      if (ratesRes.rows) {
        return (ratesRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get rates =" + error.message);
      return error;
    }
  },

  getDidDetails: async function (customer_id) {
    try {
      const query = `select id, cust_code__c, free_numb__c from ntt_kddi_freedial_c where cust_code__c::int = '${customer_id}'  and carr_comp__c='KDDI' `;
      const getDidRes = await db.queryByokakin(query, []);
      if (getDidRes.rows) {
        return (getDidRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in getting did info =" + error.message);
      return error;
    }
  },

 
  getKDDICompList: async function () {

    try {
      const query = `select id, customer_code from kddi_customer where deleted = false  order by customer_code::int `;
      const getKDDICompListRes = await db.queryByokakin(query, []);

      if (getKDDICompListRes.rows) {
        return (getKDDICompListRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get kddi comp list =" + error.message);
      return error;
    }
  },
  getKDDIOutboundRAWData: async function (billingYear, billingMonth, customer_code) {

    try {

      const query =`select  raw_cdr.* from byokakin_kddi_raw_cdr_${billingYear}${billingMonth} raw_cdr join ntt_kddi_freedial_c free_dial on 
      (regexp_replace(raw_cdr.did, '[^0-9]', '', 'g')=free_dial.free_numb__c 
      and free_dial.cust_code__c::int = '${customer_code}' and  free_dial.carr_comp__c='KDDI')`;

      const getKDDIRAWDataRes = await db.queryByokakin(query, []);

      if (getKDDIRAWDataRes.rows) {
        return (getKDDIRAWDataRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get kddi raw data =" + error.message);
      return error;
    }
  },

  getKDDIRAWInboundData: async function (billingYear, billingMonth, customer_code) {
    
    try {

      const query = `select  raw_cdr.* from byokakin_kddi_infinidata_${billingYear}${billingMonth} raw_cdr join ntt_kddi_freedial_c free_dial on 
      (regexp_replace(raw_cdr.did, '[^0-9]', '', 'g')=free_dial.free_numb__c 
      and free_dial.cust_code__c::int = '${customer_code}' and  free_dial.carr_comp__c='KDDI')`;


      const getKDDIRAWInboundDataRes = await db.queryByokakin(query, []);

      if (getKDDIRAWInboundDataRes.rows) {
        return (getKDDIRAWInboundDataRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get kddi raw inbound data =" + error.message);
      return error;
    }
  },

  getSummaryData: async function(customerId, year, month){
    try{

      const query =`select customercode, cdr_amount::int as cdr_amount, kotei_amount  from ( select customercode, sum (finalcallcharge) as cdr_amount  from  byokakin_kddi_processedcdr_${year}${month} 
       where customercode='${customerId}' group by customercode) as bkpc join 
       (select sum(amount) kotei_amount, substring(split_part(bill_numb__c, '-',2),4) as comp_code 
       from kddi_kotei_bill_details where bill_start__c::date ='${year}-${month}-01' and bill_numb__c ilike '%${customerId}%' 
       group by substring(split_part(bill_numb__c, '-',2),4)) as kkbd on (bkpc.customercode::int= kkbd.comp_code::int)`;

       const summaryRes = await db.queryByokakin(query,[]);
       if(!summaryRes){
        throw new Error('not found')
       }
       return summaryRes.rows;

    }catch(error){
      console.log("error in geting summary data.."+error.message);
      throw new Error("error in geting summary data.."+error.message);
    }
  },
  createSummaryData: async function (bill_no, customer_id, year, month, data) {

    try {

      let tax = 0, subtotal = 0, total = 0 ;
      if(data && data.length === 0){
         throw new Error ('there is no data');
      }
      subtotal = parseInt(data[0]['cdr_amount'],10) + parseInt(data[0]['kotei_amount'],10) ;
      tax = (subtotal*.1);
      total = subtotal + tax;

      let query = `insert into byokakin_billing_history (bill_no , customercode , carrier , cdrmonth , billtype , count , fixed_cost_subtotal ,
        cdr_cost_subtotal , subtotal , tax , total , remarks , date_insert , name_insert , date_update , name_update )
         VALUES('1', '${customer_id}', 'KDDI', '${year}-${month}-1', 'R' , 1, '${data[0]['kotei_amount']}', '${data[0]['cdr_amount']}',
            '${subtotal}' , '${tax}','${total}','kddi billing by system','now()','System','now()','System' )`;
      console.log("query==" + query);
      await db.queryByokakin(query, []);

    } catch (error) {
      console.log("Error---" + error.message);
      return error;
    }
  },

  insertProcessedDataByBatches: async function (callType, records, rates, customerId, billingYear, billingMonth) {

    let res = [];
    let resArr = [];
    let chunkArray;

    try {
      chunkArray = chunk(records, BATCH_SIZE);
      let tableName = `byokakin_kddi_processedcdr_${billingYear}${billingMonth}`;
      let tableNameKDDIProcessedData = { table: tableName };

      for (let i = 0; i < chunkArray.length; i++) {
        const data = await getNextInsertBatch(callType, chunkArray[i], rates, customerId, billingYear, billingMonth);
        res = await db.queryBatchInsertByokakin(data, ColumnSetKDDIProcessedData, tableNameKDDIProcessedData);
        resArr.push(res);
      }
    } catch (err) {
      console.log("Error: " + err.message);
    }

    console.log("done" + new Date());
    console.log(resArr);
    return resArr;

  },
}


async function getNextInsertBatch(cdrType, data, rates, customerId, billingYear, billingMonth) {

  let valueArray = [];

  try {
    for (let i = 0; i < data.length; i++) {
      let obj = {}, terminalType, freedialNumber, callingNumber, callDuration, destinationArea, chargeAmt, callDate, callTime, sourceArea, callCharge ;

      freedialNumber = data[i]['did'];
      

      if (cdrType === 'OUTBOUND') {
        const terminalTypeObj = await getTerminalType(data[i]['callcharge'], data[i]['cld'], data[i]['destination'], data[i]['calltype']);
        terminalType = terminalTypeObj.terminalType;
        callingNumber = data[i]['did'];
        callDuration = await getCallDuration(data[i]['callduration']);
        destinationArea = await getDestinationArea(data[i]['destination']);
        chargeAmt = await getFinalCharge(terminalTypeObj.tmpTerminalType, rates, callDuration, data[i]['callcharge'], data[i]['calltype']);
        callDate = data[i]['calldate'];
        callTime = data[i]['calltime'];
        sourceArea = '東京';
        callCharge =  data[i]['callcharge'];

      } else {
        terminalType = await getTerminalTypeInbound(data[i]['terminaltype']);
        callingNumber = data[i]['usednumber'];
        callDate = data[i]['calldate'].substr(0,4) + '-' + data[i]['calldate'].substr(4,2) + '-' + data[i]['calldate'].substr(6,2);
        callTime = await getCDRFormatTime(data[i]['calltime']);
        callDuration = await getCallDuration(await getCDRFormatTime(data[i]['callduration']));
        sourceArea = data[i]['source'] ;
        destinationArea = data[i]['destination'];
        callCharge = null;
        chargeAmt = await getFinalCharge(terminalType, rates, callDuration, data[i]['callcharge'], data[i]['calltype'] , 'INBOUND');
      }

      obj['cdrid'] = data[i]['cdrid'];
      obj['cdrclassification'] = cdrType;
      obj['customercode'] = customerId;
      obj['terminaltype'] = terminalType;
      obj['freedialnumber'] = freedialNumber;
      obj['callingnumber'] = callingNumber;
      obj['calldate'] = callDate;
      obj['calltime'] = callTime;
      obj['callduration'] = callDuration;
      obj['cld'] = data[i]['cld'];
      obj['sourcearea'] = sourceArea;
      obj['destinationarea'] = destinationArea;
      obj['cdrcallcharge'] = callCharge;
      obj['callrate'] = chargeAmt.callRate;
      obj['finalcallcharge'] = chargeAmt.resFinalCharge;
      obj['vendorcallcharge'] = chargeAmt.vendorCallCharge;
      valueArray.push(obj);
    }
  } catch (err) {
    console.log("err" + err.message);
  }
  console.log("actual data==" + JSON.stringify(valueArray[0]))
  return valueArray;

}




async function getTerminalTypeInbound(terminalType){
  let result = "";

  //console.log("terminal type..."+terminalType);

  if(terminalType.search(/L|I|S|N|U/) !== -1){
    result = '固定';
  }else if(terminalType.search(/C|A/) !== -1){
    result = '携帯';
  }else if(terminalType.search(/X|^/) !== -1){
    result = '公衆';
  }else{
    result = 'その他'
  }
  
  return result;

}


async function getCDRFormatTime(time){
 
  const tmp = time.toString().padStart(7, "0");

  return tmp.substr(0,2) + ':' + tmp.substr(2,2) + ':' + tmp.substr(4,2)+ '.' + tmp.substr(6,1) ;

}


async function getFinalCharge(terminalType, rates, callDuration, callCharge, callType, CDR_CLASSIFICATION) {
  let resData = {};
  try {

    let callSort = "";
    
    if(CDR_CLASSIFICATION == 'INBOUND'){
      callSort = terminalType;
    }else{
      callSort = await getCDRCallSortOutboud(terminalType, callType);
    }


    let ratesData = rates.filter((obj) => (
      obj.call_sort__c === callSort ? true : false
    ))

    if(ratesData.length > 0){
      ratesData = ratesData[0];
    }else{
      resData['resFinalCharge'] = callCharge;
      resData['vendorCallCharge'] = callCharge;
      resData['callRate'] = 0 ;
      return resData;
    }

    if (terminalType.includes("その他")) {
      resData['resFinalCharge'] = callCharge;
      resData['vendorCallCharge'] = callCharge;
      resData['callRate'] = ratesData.amnt_conv__c ;
      return resData;
    }

    if (callCharge == 0) {
      resData['resFinalCharge'] = callCharge;
      resData['vendorCallCharge'] = callCharge;
      resData['callRate'] = ratesData.amnt_conv__c ;
      return resData;
    } 
    
      let resFinalCharge = 0 ,  vendorCallCharge =0; 

      if (ratesData.rate_per_min == 0) {
         resFinalCharge = Math.ceil(callDuration / ratesData.kaki_valu__c) * (ratesData.amnt_conv__c);
         vendorCallCharge = Math.ceil(callDuration / 1) * (1 * ratesData.genka_rate__c / 60)
      } else {
        resFinalCharge = Math.ceil(callDuration / ratesData.kaki_valu__c) * (ratesData.kaki_valu__c * ratesData.amnt_conv__c / 60)
        vendorCallCharge = Math.ceil(callDuration / 1) * (1 * ratesData.genka_rate__c / 60)
      }

      resData['resFinalCharge'] = resFinalCharge;
      resData['vendorCallCharge'] = vendorCallCharge;
      resData['callRate'] = ratesData.amnt_conv__c ;

    //console.log("call rates.."+)

  } catch (err) {
    console.log("error in final charge ." + err.message);
  }
  return resData;
}

function getDestinationArea(dest) {
  let res = "";
  try {
    if (dest.toString().length > 0) {
      res = dest.toString().replace('*', '');
    }
  } catch (err) {
    console.log("error in get destination.." + err.message)
  }
  return res;
}

async function getTerminalType(callCharge, cld, destination, callType) {

  let res = {}, terminalType = "" , firstFourDigit = "", firstThreeDigit = "", firstDigit = "", copyTerminalType = '';
  try {
    firstFourDigit = cld.substring(0, 4);
    firstThreeDigit = cld.substring(0, 3);
    firstDigit = cld.substring(0, 1);

    if (parseInt(callCharge, 10) == 0) {
      terminalType = 'IP電話';
      return {"terminalType":terminalType, "tmpTerminalType":terminalType}
    }

    if (firstFourDigit == '0035' || firstFourDigit == '0180' || firstFourDigit == '0570' ||
      firstFourDigit == '0990' || firstThreeDigit == '020' || cld == '104' || cld == '110' || cld == '114' ||
      cld == '117' || cld == '188' || cld == '177' || destination == '衛星船舶') {

      terminalType = 'その他';

    } else if (firstDigit != '0' && cld != '104' && cld != '110' && cld != '114' &&
      cld != '117' && cld != '188' && cld != '177') {

      terminalType = 'その他 - Intl';

    } else if ((firstThreeDigit == '070' || firstThreeDigit == '080' || firstThreeDigit == '090') && destination != 'PHS') {

      terminalType = "携帯";

    } else if (destination == 'PHP') {

      terminalType = "PHS";

    } else if (destination == 'ＩＰ電話') {

      terminalType = "IP電話";

    } else if (destination == 'IP(有料)') {

      terminalType = "IP(有料)";

    } else if (destination == 'TELEGRAM') {

      terminalType = "その他 - 税込み";

    } else {
      terminalType = "固定";
    }

    copyTerminalType = terminalType;

    if (!terminalType.includes('その他')) {
      terminalType = await getCDRCallSortOutboud(terminalType, callType);
    }


  } catch (error) {
    console.log("Error in get terminal type.." + error.message)
  }

  return {"terminalType":terminalType, "tmpTerminalType":copyTerminalType} ;
}


async function getCDRCallSortOutboud(terminalType, callType) {

  let tmpTerminalType = "";
  if (terminalType == '携帯' || terminalType == 'PHS') {
    tmpTerminalType = '携帯';
  } else if (terminalType == 'IP(有料)' && callType == '携帯呼') {
    tmpTerminalType = '携帯'
  } else {
    tmpTerminalType = '固定';
  }
  return tmpTerminalType;

}

async function getCallDuration(duration) {

  let resDuration = "";
  try {
    const arr = duration.split(":");
    resDuration = (+arr[0]) * 60 * 60 + (+arr[1]) * 60 + (+arr[2]);
    resDuration = Math.ceil(resDuration)
  } catch (error) {
    console.log("Error in get call duration.." + error.message)
  }

  return resDuration;
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



