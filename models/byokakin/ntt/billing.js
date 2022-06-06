var db = require('./../../../config/database');
const BATCH_SIZE = 1000000;
var PDFDocument = require("pdfkit");
var utility = require('../../../public/javascripts/utility');
var fs = require("fs");

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
      const query = `select id, customer_code from kddi_customer where customer_code::int in (select  distinct(substring(split_part(bill_numb__c, '-',2),4))::int  as comp_code  from  kddi_kotei_bill_details where to_char(bill_start__c::date, 'MM-YYYY') ='04-2022') and deleted = false  order by customer_code::int `;
     // const query = `select id, customer_code from kddi_customer where customer_code::int= '516' and deleted = false  order by customer_code::int `;
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

      const query = `select  raw_cdr.* from byokakin_kddi_raw_cdr_${billingYear}${billingMonth} raw_cdr join ntt_kddi_freedial_c free_dial on 
      (regexp_replace(raw_cdr.did, '[^0-9]', '', 'g') = free_dial.free_numb__c 
      and free_dial.cust_code__c::int = '${customer_code}' and 
      (free_dial.stop_date__c is null or free_dial.stop_date__c !='1800-01-01 00:00:00')  and  free_dial.carr_comp__c='KDDI' ) `;

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
      (regexp_replace(raw_cdr.did, '[^0-9]', '', 'g')=free_dial.free_numb__c  and 
      (free_dial.stop_date__c is null or free_dial.stop_date__c !='1800-01-01 00:00:00')
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

  getSummaryData: async function (customerId, year, month) {
    try {

      const query = `select customercode, cdr_amount::int as cdr_amount, kotei_amount  from ( select customercode,
         sum (finalcallcharge) as cdr_amount  from  byokakin_kddi_processedcdr_${year}${month} 
       where customercode='${customerId}' group by customercode) as bkpc join 
       (select sum(amount) kotei_amount, substring(split_part(bill_numb__c, '-',2),4) as comp_code 
       from kddi_kotei_bill_details where bill_start__c::date ='${year}-${month}-01' and bill_numb__c ilike '%${customerId}%' 
       group by substring(split_part(bill_numb__c, '-',2),4)) as kkbd on (bkpc.customercode::int= kkbd.comp_code::int)`;

      const summaryRes = await db.queryByokakin(query, []);
      if (!summaryRes) {
        throw new Error('not found')
      }
      return summaryRes.rows;

    } catch (error) {
      console.log("error in geting summary data.." + error.message);
      throw new Error("error in geting summary data.." + error.message);
    }
  },
  createSummaryData: async function (bill_no, customer_id, year, month, data) {

    try {

      let tax = 0, subtotal = 0, total = 0;
      if (data && data.length === 0) {
        throw new Error('there is no data');
      }
      subtotal = parseInt(data[0]['cdr_amount'], 10) + parseInt(data[0]['kotei_amount'], 10);
      tax = (subtotal * .1);
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

  genrateInvoice: async function (company_code, billingYear, billingMonth) {
    try {

      let path = __dirname + `\\Invoice\\${company_code}${billingYear}${billingMonth}.pdf`;

      const invoiceData = await getInvoiceData(company_code, billingYear, billingMonth);
      const customerAddress = await getCustomerInfo(company_code);
      let koteiAmount = 0;
      let cdrAmount = 0;

      invoiceData.map(obj => {
        koteiAmount = koteiAmount + parseFloat(obj.kotei_amount);
        cdrAmount = cdrAmount + parseFloat(obj.cdr_amount);
      });

      cdrAmount = parseInt(cdrAmount,10);
      koteiAmount = parseInt(koteiAmount,10);

      await createInvoice(company_code, customerAddress, billingYear, billingMonth, invoiceData, path, koteiAmount, cdrAmount);
      console.log("Done...")
    } catch (err) {
      console.log("error...." + err.message);
    }
  },
}


async function createInvoice(company_code, address, billingYear, billingMonth, invoice, path, koteiAmount, cdrAmount) {

  const subTotal = parseInt(koteiAmount + cdrAmount);
  const tax = parseInt(subTotal * .1);
  const totalAmount = subTotal + tax;

  let doc = new PDFDocument({ margin: 50 });
  let MAXY = doc.page.height - 50;
  let fontpath = (__dirname + '\\..\\..\\..\\controllers\\font\\ipaexg.ttf');
  doc.font(fontpath);

  let y = await generateHeader(address, doc, koteiAmount, cdrAmount, subTotal, tax, totalAmount);
  //drawLine(doc, 198);
  console.log("y=--" + y);
  drawLine(doc, y + 25);
  basciInfo(doc, y + 25, company_code, billingYear, billingMonth)
  drawLine(doc, y + 75);

  y = generateCustomerInformation(doc, invoice, y + 175, koteiAmount, cdrAmount, subTotal, tax, totalAmount);

  addTableHeader(doc, y + 25);

  y = customTable(doc, y + 35, invoice, MAXY);
  doc.end();
  doc.pipe(fs.createWriteStream(path));
}



function generateCustomerInformation(doc, invoice, y, koteiAmount, cdrAmount, subTotal, tax, totalAmount) {


  doc
    .text(`固定費小計`, 50, y, { width: 100, align: "center" })
    .text(`通話料小計`, 150, y, { width: 100, align: "center" })
    .text(`小計`, 250, y, { width: 100, align: "center" })
    .text(`消費税`, 350, y, { width: 100, align: "center" })
    .text(`合計`, 450, y, { width: 110, align: "center" })

  doc.rect(50, y - 5, 100, 30).stroke()
  doc.rect(150, y - 5, 100, 30).stroke()
  doc.rect(250, y - 5, 100, 30).stroke()
  doc.rect(350, y - 5, 100, 30).stroke()
  doc.rect(450, y - 5, 110, 30).stroke()
    .fontSize(12)
    .text(`¥${utility.numberWithCommas(koteiAmount)}`, 50, y + 30, { width: 100, align: "center" })
    .text(`¥${utility.numberWithCommas(cdrAmount)}`, 150, y + 30, { width: 100, align: "center" })
    .text(`¥${utility.numberWithCommas(subTotal)}`, 250, y + 30, { width: 100, align: "center" })
    .text(`¥${utility.numberWithCommas(tax)}`, 350, y + 30, { width: 100, align: "center" })
    .text(`¥${utility.numberWithCommas(totalAmount)}`, 450, y + 30, { width: 110, align: "center" })
    .fontSize(8)
  doc.rect(50, y + 25, 100, 25).stroke()
  doc.rect(150, y + 25, 100, 25).stroke()
  doc.rect(250, y + 25, 100, 25).stroke()
  doc.rect(350, y + 25, 100, 25).stroke()
  doc.rect(450, y + 25, 110, 25).stroke()

    .moveDown();
  return y + 35;
}

function basciInfo(doc, y, company_code, billingYear, billingMonth) {
  doc
    .fontSize(8)
    .text(`明細番号`, 50, y + 10, { width: 100, align: "left" })
    .text(`会社 `, 50, y + 25, { width: 100, align: "left" })
    .text(`1000000${company_code}_KDDI_${billingYear}${billingMonth}_01`, 125, y + 10, { width: 250, align: "left" })
    .text(`現代通信株式会社 `, 125, y + 25, { width: 100, align: "left" })

    .text(`ご利用月`, 50, y + 65, { width: 100, align: "left" })
    .text(`請求日 `, 50, y + 80, { width: 100, align: "left" })

    .text(`2022-03-01 ～ 2022-03-31`, 125, y + 65, { width: 250, align: "left" })
    .text(`2022-04-14`, 125, y + 80, { width: 100, align: "left" })

    .moveDown()
  return y + 35;
}

function drawLine(doc, startX, Y = 50, Z = 560) {
  doc
    .moveTo(Y, startX)                            // set the current point
    .lineTo(Z, startX)                            // draw a line
    .stroke();
  return doc;                                // stroke the path
}

function addTableHeader(doc, y) {


  doc
    .fontSize(12)
    .text(`課金番号`, 50, y+5, { width: 75, align: "center" })
    .text(`統合明細科目名称`, 125, y+5, { width: 100, align: "center" })
    .text(`品 目 `, 225, y+5, { width: 200, align: "center" })
    .text(`課税対象`, 425, y+5, { width: 50, align: "center" })
    .text(`統合明細金額`, 475, y+5, { width: 85, align: "center" })

  doc.rect(50, y - 5, 75, 30).stroke()
  doc.rect(125, y - 5, 100, 30).stroke()
  doc.rect(225, y - 5, 200, 30).stroke()
  doc.rect(425, y - 5, 50, 30).stroke()
  doc.rect(475, y - 5, 85, 30).stroke()

    //drawLine(doc, y)
    .moveDown();
}


function customTable(doc, y, data, MAXY) {
  console.log("in table ");
  let height = y;
  let counter = 1;
  for (let i = 0; i < data.length; i++) {
    height = height + 20;
    textInRowFirst(doc, data[i].account, 50, height, "center", 75);
    textInRowFirst(doc, data[i].servicename, 125, height, "center", 100);
    textInRowFirst(doc, data[i].productname, 225, height, "center", 200);
    textInRowFirst(doc, data[i].taxinclude, 425, height, "center", 50);
    textInRowFirst(doc, '¥' + utility.numberWithCommas(parseFloat(data[i].amount).toFixed(2)), 475, height, "right", 85);

    if (height >= 680) {
      doc.text(counter, 500, 720)
      doc.addPage({ margin: 50 })
      height = 50;
      counter++;
      //addTableHeader(doc, 50, 50);

    }
  }
  doc.text(counter, 500, 720)

  return height;
}

function textInRowFirst(doc, text, x, heigth, align, width) {

  doc.y = heigth;
  doc.x = x;
  doc.fontSize(8)
  doc.fillColor('black')
  doc.text(text, { width, align })
  doc.rect(x, heigth - 5, width, 20).stroke()

  return doc;
}


async function generateHeader(customerDetails, doc) {

  const postNumber = customerDetails[0]['post_number'];
  const customerName = customerDetails[0]['customer_name'];
  const address = customerDetails[0]['address'];

  const Phone = "TEL. 03-3549-7621（代）";
  const Fax = "FAX. 03-3545-7331";


  doc
    // .image("logo.png", 50, 45, { width: 50 })
    //.fillColor("#444444")
    .fontSize(10)
    .text(`株式会社　アイ・ピー・エス`, 50, 57, { align: "right" })
    .text(`〒${postNumber}`, 50, 70, { align: "right" })
    .text(`${address}`, 50, 83, { align: "right" })
    .text(`${Phone}`, 10, 96, { align: "right" })
    .text(`${Fax}`, 10, 109, { align: "right" })
    .fontSize(30)
    .text("通信費明細書", 50, 80, { align: "left" })

    .moveDown();
  return 140;

}

async function generateFooter(doc, y) {
  // console.log("in footer")
  doc
    .fontSize(8)
    .text("≪　ご連絡事項　≫", 50)
    .moveDown()
    .text("毎度格別のお引き立てをいただきまして、誠にありがとうございます。")
    .moveDown()
    .text("ご請求書を送付させていただきますので、ご査収の上お支払期日までに上記の振込先にお振込いただきますようよろしくお願い申し上げます。")
    .moveDown()
    .text("なお、誠に勝手ながら銀行振込に係る手数料につきましては、貴社にてご負担いただきますようお願い申し上げます。")
    .moveDown()

}


async function getCustomerInfo(company_code) {
  try {
    const query = `select * from m_customer where customer_cd='00000130'`;

    const ratesRes = await db.queryIBS(query, [], true);

    if (ratesRes.rows) {
      return (ratesRes.rows);
    }

  } catch (error) {
    return error;
  }
}

async function getInvoiceData(company_code, year, month) {
  try {
    const query = `select * from (select (amount) amount, 0 as cdr_amount, (amount) kotei_amount , 
    substring(split_part(bill_numb__c, '-',2),4) as comp_code, cdrid, servicename, productname, taxinclude, account
     from kddi_kotei_bill_details where bill_start__c::date ='2022-03-01' and bill_numb__c ilike '%${company_code}%' 
      UNION ALL
       select   sum( case when terminaltype!='その他' then finalcallcharge else 0 end) as amount ,
       sum( case when terminaltype!='その他' then finalcallcharge else 0 end) as amount, 0 as kotei_amount ,
        '' as  comp_code, 0 as cdrid, 'ダイヤル通話料' as servicename, '' as productname,'' as taxinclude, 
        replace(freedialnumber,'-','') as account   from  byokakin_kddi_processedcdr_${year}${month} 
          where customercode='${company_code}' and ( case when terminaltype!='その他' then finalcallcharge else 0 end) > 0 group by  freedialnumber 
          UNION ALL
          select   sum( case when terminaltype='その他' then finalcallcharge else 0 end) as amount, 
          sum( case when terminaltype='その他' then finalcallcharge else 0 end) as amount, 0 as kotei_amount ,
          '' as  comp_code, 0 as cdrid, 'その他通話料' as servicename, '' as productname,'' as taxinclude, 
          replace(freedialnumber,'-','') as account   from  byokakin_kddi_processedcdr_${year}${month} 
            where customercode='${company_code}' and ( case when terminaltype='その他' then finalcallcharge else 0 end) > 0 group by  freedialnumber              
      )as foo order by account, servicename` ;
    const ratesRes = await db.queryByokakin(query, []);

    if (ratesRes.rows) {
      return (ratesRes.rows);
    }

  } catch (error) {
    return error;
  }
}


async function getNextInsertBatch(cdrType, data, rates, customerId, billingYear, billingMonth) {

  let valueArray = [];

  try {
    for (let i = 0; i < data.length; i++) {
      let obj = {}, terminalType, freedialNumber, callingNumber, callDuration, destinationArea, chargeAmt, callDate, callTime, sourceArea, callCharge;

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
        callCharge = data[i]['callcharge'];

      } else {
        terminalType = await getTerminalTypeInbound(data[i]['terminaltype']);
        callingNumber = data[i]['usednumber'];
        callDate = data[i]['calldate'].substr(0, 4) + '-' + data[i]['calldate'].substr(4, 2) + '-' + data[i]['calldate'].substr(6, 2);
        callTime = await getCDRFormatTime(data[i]['calltime']);
        callDuration = await getCallDuration(await getCDRFormatTime(data[i]['callduration']));
        sourceArea = data[i]['source'];
        destinationArea = data[i]['destination'];
        callCharge = null;
        chargeAmt = await getFinalCharge(terminalType, rates, callDuration, data[i]['callcharge'], data[i]['calltype'], 'INBOUND');
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




async function getTerminalTypeInbound(terminalType) {
  let result = "";

  //console.log("terminal type..."+terminalType);

  if (terminalType.search(/L|I|S|N|U/) !== -1) {
    result = '固定';
  } else if (terminalType.search(/C|A/) !== -1) {
    result = '携帯';
  } else if (terminalType.search(/X|^/) !== -1) {
    result = '公衆';
  } else {
    result = 'その他'
  }

  return result;

}


async function getCDRFormatTime(time) {

  const tmp = time.toString().padStart(7, "0");

  return tmp.substr(0, 2) + ':' + tmp.substr(2, 2) + ':' + tmp.substr(4, 2) + '.' + tmp.substr(6, 1);

}


async function getFinalCharge(terminalType, rates, callDuration, callCharge, callType, CDR_CLASSIFICATION) {
  let resData = {};

  //console.log("terminalType.."+terminalType);
 
  //console.log("callCharge.."+callCharge);
  //console.log("terminalType.."+terminalType);
  try {

    let callSort = "";

    if (CDR_CLASSIFICATION == 'INBOUND') {
      callSort = terminalType;
    } else {
      callSort = await getCDRCallSortOutboud(terminalType, callType);
    }


    let ratesData = rates.filter((obj) => (
      obj.call_sort__c === callSort ? true : false
    ))

    //console.log("ratesData.."+ JSON.stringify(ratesData));

    if (ratesData.length > 0) {
      ratesData = ratesData[0];
    } else {
      resData['resFinalCharge'] = callCharge;
      resData['vendorCallCharge'] = callCharge;
      resData['callRate'] = 0;
      return resData;
    }

    if (terminalType.includes("その他")) {
      resData['resFinalCharge'] = callCharge;
      resData['vendorCallCharge'] = callCharge;
      resData['callRate'] = ratesData.amnt_conv__c;
      return resData;
    }

    if (callCharge == 0) {
      resData['resFinalCharge'] = callCharge;
      resData['vendorCallCharge'] = callCharge;
      resData['callRate'] = ratesData.amnt_conv__c;
      return resData;
    }

    let resFinalCharge = 0, vendorCallCharge = 0;

    if (ratesData.rate_per_min == 0) {
      resFinalCharge = Math.ceil(callDuration / ratesData.kaki_valu__c) * (ratesData.amnt_conv__c);
      vendorCallCharge = Math.ceil(callDuration / 1) * (1 * ratesData.genka_rate__c / 60)
    } else {
      resFinalCharge = Math.ceil(callDuration / ratesData.kaki_valu__c) * (ratesData.kaki_valu__c * ratesData.amnt_conv__c / 60)
      vendorCallCharge = Math.ceil(callDuration / 1) * (1 * ratesData.genka_rate__c / 60)
    }

    resData['resFinalCharge'] = resFinalCharge;
    resData['vendorCallCharge'] = vendorCallCharge;
    resData['callRate'] = ratesData.amnt_conv__c;

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

  let res = {}, terminalType = "", firstFourDigit = "", firstThreeDigit = "", firstDigit = "", copyTerminalType = '';
  try {
    firstFourDigit = cld.substring(0, 4);
    firstThreeDigit = cld.substring(0, 3);
    firstDigit = cld.substring(0, 1);

    if (parseInt(callCharge, 10) == 0) {
      terminalType = 'IP電話';
      return { "terminalType": terminalType, "tmpTerminalType": terminalType }
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

  return { "terminalType": terminalType, "tmpTerminalType": copyTerminalType };
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



