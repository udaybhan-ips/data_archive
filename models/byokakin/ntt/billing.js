var db = require('./../../../config/database');
const BATCH_SIZE = 100000;
var PDFDocument = require("pdfkit");
var utility = require('../../../public/javascripts/utility');
var fs = require("fs");
const path = require('path');

let ColumnSetNTTProcessedData = ['cdrid', 'cdrclassification', 'customercode', 'terminaltype', 'freedialnumber', 'callingnumber', 'calldate',
  'calltime', 'callduration', 'cld', 'sourcearea', 'destinationarea', 'cdrcallcharge', 'callrate', 'finalcallcharge', 'vendorcallcharge',
  'callcount104', 'carriertype'];



module.exports = {

  getRates: async function (customer_id) {
    try {
      const query = `select  * from ntt_kddi_rate_c where customer_code ='${customer_id}'  and end_date::date >  now()::date and serv_name ='NTT'`;

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
       and serv_name__c ='NTT' and dist_rang_from__c='0' and dist_rang_to__c ='0' `;

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
      const query = `select id, cust_code__c, free_numb__c from ntt_kddi_freedial_c 
      where cust_code__c::int = '${customer_id}'  and carr_comp__c='NTT' and 
      (stop_date__c is null or stop_date__c!='1800-01-01 00:00:00.000' ) `;
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


  getNTTCompList: async function () {

    try {
      const query = `select id, customer_cd as customer_code , customer_name from m_customer 
      where  is_deleted = false       and service_type ->> 'ntt_customer'  = 'true' 
      and customer_cd in ('00001339')
       order by customer_code   `;
      // const query = `select id, customer_code from kddi_customer where customer_code::int= '516' and deleted = false  order by customer_code::int `;
      const getNTTCompListRes = await db.query(query, [], true);

      if (getNTTCompListRes.rows) {
        return (getNTTCompListRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get kddi comp list =" + error.message);
      return error;
    }
  },
  getNTTOutboundRAWData: async function (billingYear, billingMonth, customer_code, carrier) {

    try {

      let where = `where raw_cdr.carriertype ='NTT' and raw_cdr.callcharge > 0 `; 

    //  if(customer_code !=='00001166'){
    //     where += `and raw_cdr.callcharge > 0`
    //  }

      const query = `select  raw_cdr.*, 0 as callcount104 from 
      byokakin_ntt_rawcdr_outbound_${billingYear}${billingMonth}  raw_cdr join ntt_kddi_freedial_c free_dial on 
      (regexp_replace(raw_cdr.did, '[^0-9]', '', 'g') = free_dial.free_numb__c 
      and free_dial.cust_code__c::int = '${customer_code}' and 
      (free_dial.stop_date__c is null or free_dial.stop_date__c !='1800-01-01 00:00:00')  
      and  free_dial.carr_comp__c='NTT' ) ${where} `;


      console.log("query..."+query);

      const getNTTRAWDataRes = await db.queryByokakin(query, []);

      if (getNTTRAWDataRes.rows) {
        return (getNTTRAWDataRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get kddi raw data =" + error.message);
      return error;
    }
  },

  getNTTRAWInboundData: async function (billingYear, billingMonth, customer_code, carrier) {

    try {
      let where = `where raw_cdr.carriertype ='NTT'`; 
      const query = `select  raw_cdr.*,  0 as callcount104 from 
      byokakin_ntt_rawcdr_inbound_${billingYear}${billingMonth} raw_cdr join ntt_kddi_freedial_c free_dial on 
      (regexp_replace(raw_cdr.did, '[^0-9]', '', 'g')=free_dial.free_numb__c  and 
      (free_dial.stop_date__c is null or free_dial.stop_date__c !='1800-01-01 00:00:00')
      and free_dial.cust_code__c::int = '${customer_code}' and  free_dial.carr_comp__c='NTT'  ) ${where} `;


      const getNTTRAWInboundDataRes = await db.queryByokakin(query, []);

      if (getNTTRAWInboundDataRes.rows) {
        return (getNTTRAWInboundDataRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get kddi raw inbound data =" + error.message);
      return error;
    }
  },

  deleteSummaryData: async function (customerId, year, month) {
    try {

      const query = `delete from byokakin_billing_history where customercode='${customerId}' 
      and carrier ='NTT'  and cdrmonth::date ='${year}-${month}-01' `;

      const deleteRes = await db.queryByokakin(query, []);
      
      return deleteRes;

    } catch (error) {
      console.log("error in geting summary data.." + error.message);
      throw new Error("error in geting summary data.." + error.message);
    }
  },

  getSummaryData: async function (customerId, year, month) {
    try {

      const query = `select customercode, trunc(cdr_amount::numeric,0) as cdr_amount, kotei_amount  from ( select customercode,
         sum (finalcallcharge) as cdr_amount  from  byokakin_ntt_processedcdr_${year}${month} 
       where customercode='${customerId}' and carriertype ='NTT'  group by customercode) as bkpc full join 
       (select sum(kingaku) kotei_amount, comp_acco__c 
       from ntt_koteihi_cdr_bill where datebill::date ='${year}-${month}-01' and comp_acco__c = '${customerId}' 
       group by comp_acco__c) as nkcb on (bkpc.customercode= nkcb.comp_acco__c)`;

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

      let tax = 0, subtotal = 0, total = 0, subTotalCDR = 0, totalCDR = 0, taxCDR = 0, koteiAmount =0, cdrAmount =0 ;
      if (data && data.length === 0) {
        throw new Error('there is no data');
      }

      if(data[0]['kotei_amount'] !==undefined && data[0]['kotei_amount']  !=null && data[0]['kotei_amount']!='' ){
         koteiAmount = data[0]['kotei_amount']
      }

      if(data[0]['cdr_amount'] !==undefined && data[0]['cdr_amount']  !=null && data[0]['cdr_amount']!='' ){
        cdrAmount = data[0]['cdr_amount']
      }

      subtotal = parseInt(cdrAmount, 10) + parseInt(koteiAmount, 10);
      tax = (subtotal * .1);
      total = subtotal + tax;
      subTotalCDR = parseInt(cdrAmount, 10);
      taxCDR = (subTotalCDR * .1);
      totalCDR = subTotalCDR + taxCDR;

      let query = `insert into byokakin_billing_history (bill_no , customercode , carrier , cdrmonth , billtype , count , fixed_cost_subtotal ,
        cdr_cost_subtotal , subtotal , tax , total , remarks , date_insert , name_insert , date_update , name_update, cdr_cost_total, cdr_cost_tax )
        VALUES('1', '${customer_id}', 'NTT', '${year}-${month}-1', 'R' , 1, '${koteiAmount}', '${cdrAmount}',
        '${subtotal}' , '${tax}','${total}','ntt billing by system','now()','System','now()','System', '${totalCDR}', '${taxCDR}' )`;
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
      let tableName = `byokakin_ntt_processedcdr_${billingYear}${billingMonth}`;
      let tableNameNTTProcessedData = { table: tableName };

      for (let i = 0; i < chunkArray.length; i++) {
        const data = await getNextInsertBatch(callType, chunkArray[i], rates, customerId, billingYear, billingMonth);
        res = await db.queryBatchInsertByokakin(data, ColumnSetNTTProcessedData, tableNameNTTProcessedData);
        resArr.push(res);
      }
    } catch (err) {
      console.log("Error: " + err.message);
    }

    console.log("done" + new Date());
    console.log(resArr);
    return resArr;

  },

  genrateInvoice: async function (company_code, customer_name, billingYear, billingMonth, carrier) {
    try {

     // let path = __dirname + `\\data\\${carrier}\\${billingYear}${billingMonth}\\Invoice\\${company_code}${billingYear}${billingMonth}.pdf`;

      const invoiceData = await getInvoiceData(company_code, billingYear, billingMonth);
      const customerAddress = await getCustomerInfo();

      let filePath = path.join(__dirname, `../ntt/data/${carrier}/${billingYear}${billingMonth}/Invoice/10${company_code}_${billingYear}${billingMonth}明細書_${customer_name}NTT.pdf`);

      let koteiAmount = 0;
      let cdrAmount = 0;

      invoiceData.map(obj => {
        koteiAmount = koteiAmount + parseFloat(obj.kotei_amount);
        cdrAmount = cdrAmount + parseFloat(obj.cdr_amount);
      });

      cdrAmount = parseInt(cdrAmount, 10);
      koteiAmount = parseInt(koteiAmount, 10);

      if(cdrAmount<=0 && koteiAmount<=0){
        console.log("No data!!");
        return 'no data';
      }

      await createInvoice(company_code, customer_name, customerAddress, billingYear, billingMonth, invoiceData, filePath, koteiAmount, cdrAmount);
      console.log("Done...")
    } catch (err) {
      console.log("error...." + err.message);
    }
  },
}


async function createInvoice(company_code, customer_name, address, billingYear, billingMonth, invoice, path, koteiAmount, cdrAmount) {

  const subTotal = parseInt(koteiAmount + cdrAmount);
  const tax = parseInt(subTotal * .1);
  const totalAmount = subTotal + tax;

  let doc = new PDFDocument({size: [597,842], margin:50});
  let MAXY = doc.page.height ;
  let fontpath = (__dirname + '\\..\\..\\..\\controllers\\font\\ipaexg.ttf');
  doc.font(fontpath);

  let y = await generateHeader(address, doc, koteiAmount, cdrAmount, subTotal, tax, totalAmount);
  //drawLine(doc, 198);
  console.log("y=--" + y);
  drawLine(doc, y + 25);
  basciInfo(doc, y + 25, company_code, customer_name, billingYear, billingMonth)
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
    .text(`合計`, 450, y, { width: 90, align: "center" })

  doc.rect(50, y - 5, 100, 30).stroke()
  doc.rect(150, y - 5, 100, 30).stroke()
  doc.rect(250, y - 5, 100, 30).stroke()
  doc.rect(350, y - 5, 100, 30).stroke()
  doc.rect(450, y - 5, 90, 30).stroke()
    .fontSize(12)
    .text(`¥${utility.numberWithCommas(koteiAmount)}`, 50, y + 30, { width: 100, align: "center" })
    .text(`¥${utility.numberWithCommas(cdrAmount)}`, 150, y + 30, { width: 100, align: "center" })
    .text(`¥${utility.numberWithCommas(subTotal)}`, 250, y + 30, { width: 100, align: "center" })
    .text(`¥${utility.numberWithCommas(tax)}`, 350, y + 30, { width: 100, align: "center" })
    .text(`¥${utility.numberWithCommas(totalAmount)}`, 450, y + 30, { width: 90, align: "center" })
    .fontSize(8)
  doc.rect(50, y + 25, 100, 25).stroke()
  doc.rect(150, y + 25, 100, 25).stroke()
  doc.rect(250, y + 25, 100, 25).stroke()
  doc.rect(350, y + 25, 100, 25).stroke()
  doc.rect(450, y + 25, 90, 25).stroke()

    .moveDown();
  return y + 35;
}

function basciInfo(doc, y, company_code, customer_name, billingYear, billingMonth) {
  const todayYYYYMMDD= getYearMonthDay();
  const todayYYYYMMDDArr = todayYYYYMMDD.split("-");
  let numerOfDays = new Date(billingYear, billingMonth, 0).getDate();

  doc
    .fontSize(8)
    .text(`明細番号`, 50, y + 10, { width: 100, align: "left" })
    .text(`会社 `, 50, y + 25, { width: 100, align: "left" })
    .text(`10${company_code}_NTT_${billingYear}${billingMonth}_01`, 125, y + 10, { width: 250, align: "left" })
    .text(`${customer_name}`, 125, y + 25, { width: 300, align: "left" })

    .text(`ご利用月`, 50, y + 65, { width: 100, align: "left" })
    .text(`請求日 `, 50, y + 80, { width: 100, align: "left" })

    .text(`${billingYear}-${billingMonth}-01 ～ ${billingYear}-${billingMonth}-${numerOfDays}`, 125, y + 65, { width: 250, align: "left" })
    .text(`${todayYYYYMMDDArr[0]}-${todayYYYYMMDDArr[1].padStart(2, '0')}-${todayYYYYMMDDArr[2].padStart(2, '0')}`, 125, y + 80, { width: 100, align: "left" })

    .moveDown()
  return y + 35;
}

function drawLine(doc, startX, Y = 50, Z = 540) {
  doc
    .moveTo(Y, startX)                            // set the current point
    .lineTo(Z, startX)                            // draw a line
    .stroke();
  return doc;                                // stroke the path
}

function addTableHeader(doc, y) {


  doc
    .fontSize(12)
    .text(`課金対象`, 50, y + 5, { width: 75, align: "center" })
    .text(`請求内容`, 125, y + 5, { width: 300, align: "center" })
   // .text(`品 目 `, 250, y + 5, { width: 175, align: "center" })
    .text(`課税対象`, 425, y + 5, { width: 50, align: "center" })
    .text(`金額`, 475, y + 5, { width: 65, align: "center" })

  doc.rect(50, y - 5, 75, 30).stroke()
  doc.rect(125, y - 5, 300, 30).stroke()
 // doc.rect(250, y - 5, 175, 30).stroke()
  doc.rect(425, y - 5, 50, 30).stroke()
  doc.rect(475, y - 5, 65, 30).stroke()

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
   // textInRowFirst(doc, data[i].servicename, 125, height, "center", 125);
    textInRowFirst(doc, data[i].productname, 125, height, "center", 300);
    textInRowFirst(doc, data[i].taxinclude, 425, height, "center", 50);
    textInRowFirst(doc, '¥' + utility.numberWithCommas(parseFloat(data[i].amount).toFixed(2)), 475, height, "right", 65);

    if (height >= 750) {
     // doc.text(counter, 500, 720)
      doc.addPage()
      height = 50;
      counter++;
      //addTableHeader(doc, 50, 50);

    }
  }
  //doc.text(counter, 500, 720)

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

  const Phone = `TEL. ${customerDetails[0]['tel_number']}（代）`;
  const Fax = `FAX. ${customerDetails[0]['fax_number']}`;


  doc
    // .image("logo.png", 50, 45, { width: 50 })
    //.fillColor("#444444")
    .fontSize(10)
    .text(`株式会社アイ・ピー・エス・プロ`, 50, 57, { align: "right" })
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


async function getCustomerInfo() {
  try {
    const query = `select * from m_customer where customer_cd='00000130'`;

    const ratesRes = await db.query(query, [], true);

    if (ratesRes.rows) {
      return (ratesRes.rows);
    }

  } catch (error) {
    return error;
  }
}

async function getInvoiceData(company_code, year, month) {
  try {
    const query = `select * from (select (kingaku) amount, 0 as cdr_amount, (kingaku) kotei_amount , 
    comp_acco__c as comp_code, cdrid, riyougaisya as servicename, seikyuuuchiwake as productname,
     '合算10％' as taxinclude, kaisenbango as account
     from ntt_koteihi_cdr_bill where datebill::date = '${year}-${month}-01' and comp_acco__c = '${company_code}' 
      UNION ALL
       select   sum( case when terminaltype!='その他' then finalcallcharge else 0 end) as amount ,
       sum( case when terminaltype!='その他' then finalcallcharge else 0 end) as amount, 0 as kotei_amount ,
        '' as  comp_code, 0 as cdrid, 'ＮＴＴコミュニケーションズ' as servicename, 'ダイヤル通話料' as productname, '合算10％' as taxinclude, 
        replace(callingnumber,'-','') as account   from  byokakin_ntt_processedcdr_${year}${month} 
          where customercode='${company_code}' and ( case when terminaltype!='その他' then finalcallcharge else 0 end) > 0 group by  callingnumber 
          UNION ALL
          select   sum( case when terminaltype='その他' then finalcallcharge else 0 end) as amount, 
          sum( case when terminaltype='その他' then finalcallcharge else 0 end) as amount, 0 as kotei_amount ,
          '' as  comp_code, 0 as cdrid, 'ＮＴＴコミュニケーションズ' as servicename, 'その他通話料' as productname, '合算10％' as taxinclude, 
          replace(callingnumber,'-','') as account   from  byokakin_ntt_processedcdr_${year}${month} 
            where customercode='${company_code}' and ( case when terminaltype='その他' then finalcallcharge else 0 end) > 0 group by  callingnumber              
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

      if (cdrType === 'OUTBOUND') {
        terminalType = await getTerminalType(data[i]['cld'], data[i]['destination'], data[i]['calltype']);
        freedialNumber = data[i]['parentdid'];
        callingNumber = data[i]['did'];
        callDuration = await getCallDuration(data[i]['callduration']);
        destinationArea = await getDestinationArea(data[i]['destination']);
        chargeAmt = await getFinalCharge(customerId, terminalType, rates, callDuration, data[i]['callcharge']);
        callDate = data[i]['calldate'];
        callTime = data[i]['calltime'];
        sourceArea = data[i]['source'];
        callCharge = data[i]['callcharge'];

      } else {
        terminalType = await getTerminalTypeInbound(data[i]['terminaltype']);
        freedialNumber = data[i]['freedialnum'];
        callingNumber = data[i]['did'];
        callDate = data[i]['calldate'];
        callTime = data[i]['calltime'];
        callDuration = await getCallDuration(data[i]['callduration']);
        sourceArea = terminalType == '携帯' ? '' : data[i]['division'];
        destinationArea = '';
        callCharge = data[i]['callcharge'];
        chargeAmt = await getFinalCharge(customerId, terminalType, rates, callDuration, data[i]['callcharge'], data[i]['callcount104'], 'INBOUND');
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
      obj['finalcallcharge'] = await roundToFour(chargeAmt.resFinalCharge);
      obj['vendorcallcharge'] = chargeAmt.vendorCallCharge;
      obj['callcount104'] = 0;
      obj['carriertype'] = 'NTT';

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

  if (terminalType == '一般フリー／０５０' || terminalType == '一般フリー／Ｐ' || terminalType == 'その他') {
    result = 'その他';
  } else if (terminalType == '一般フリー／携帯' || terminalType == '受変（先課金）携帯' || terminalType == '０５０フリー／携帯') {
    result = '携帯';
  } else if (terminalType == '一般ﾌﾘｰ・公衆' || terminalType == '受変（先課金）公衆' || terminalType == '０５０フリー／公衆') {
    result = '公衆';
  } else {
    result = '固定'
  }

  return result;

}


async function getCDRFormatTime(time) {

  const tmp = time.toString().padStart(7, "0");

  return tmp.substr(0, 2) + ':' + tmp.substr(2, 2) + ':' + tmp.substr(4, 2) + '.' + tmp.substr(6, 1);

}


async function getFinalCharge(customerId, terminalType, rates, callDuration, callCharge, CALLCOUNT104, CDR_CLASSIFICATION) {
  let resData = {};

  //  console.log("terminalType.."+terminalType);

  //console.log("callCharge.."+callCharge);
  //console.log("terminalType.."+terminalType);
  try {

    let callSort = terminalType;

    if(callSort == '固定' ) {

      //console.log("duration..."+duration)

      resData = getActualRates(rates[0].fixed_rate, callDuration)
  
    }else if(callSort == '携帯'){
      resData = getActualRates(rates[0].mobile_rate, callDuration)
  
    }else if(callSort == '公衆'){
      resData = getActualRates(rates[0].public_rate, callDuration)
    }else if(callSort == 'ナビダイヤル'){
      resData = getActualRates(rates[0].navi_dial_rate, callDuration)

    }else if(callSort == 'その他'){
      resData = getActualRates(rates[0].sonota_rate, callDuration)
    }

    if(customerId=='00001166' ){
      if (terminalType.includes("その他")) {
        resData['resFinalCharge'] = callCharge;
        resData['vendorCallCharge'] = callCharge;      
      }
    }else{
      if (terminalType.includes("その他") || callCharge == 0 ) {
        resData['resFinalCharge'] = callCharge;
        resData['vendorCallCharge'] = callCharge;      
      }
    }

    

    return resData;

  } catch (err) {
    console.log("error in final charge ." + err.message);
  }
  return resData;
}


function getActualRates (ratesData, callDuration ){

  let resData = {}, vendorCallCharge =0, finalCallCharge =0 ;
  
  try{
  resData['callRate'] = ratesData.sale_rate;      
  vendorCallCharge = parseFloat(callDuration / 1) * (1 * ratesData.ips_rate / 60);
  vendorCallCharge = vendorCallCharge.toFixed(5);
  if (ratesData.billing_type == 0) {
    finalCallCharge = parseFloat(callDuration / 1) * (1 * ratesData.sale_rate/60);      
    finalCallCharge = finalCallCharge.toFixed(5)
  } else {
    finalCallCharge = Math.ceil(parseFloat(callDuration / ratesData.billing_second)) * (ratesData.billing_second * ratesData.sale_rate / 60);
    finalCallCharge = finalCallCharge.toFixed(5);      
  }
  resData['vendorCallCharge'] = vendorCallCharge;
  resData['resFinalCharge'] = finalCallCharge;

}catch(err){
  console.log("Error in actual calculating rate data.."+err.message)
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

async function getTerminalType(cld, destination, callType) {

  let res = {}, terminalType = "", firstFourDigit = "", firstThreeDigit = "", firstDigit = "", copyTerminalType = '';
  try {
    firstFourDigit = cld.substring(0, 4);
    firstThreeDigit = cld.substring(0, 3);
    firstDigit = cld.substring(0, 1);

    // if (parseInt(callCharge, 10) == 0) {
    //   terminalType = 'IP電話';
    //   return { "terminalType": terminalType, "tmpTerminalType": terminalType }
    // }

    if (firstFourDigit == '0035' || firstFourDigit == '0180' || firstFourDigit == '0570' ||
      firstFourDigit == '0990' || firstThreeDigit == '020' || cld == '104' || cld == '110' || cld == '114' ||
      cld == '117' || cld == '188' || cld == '177' || destination == '衛星船舶' || destination == 'ＰＨＳ'
      || destination == 'ＰＨＳ通話' || destination == 'Ｉ　Ｐ' || destination == 'ＩＰ通話' || destination == '他ＩＰ通話') {

      terminalType = 'その他';

    } else if (callType == '国際' && destination == '国際通話') {

      terminalType = 'その他 - Intl';

    } else if ((firstThreeDigit == '070' || firstThreeDigit == '080' || firstThreeDigit == '090') && destination != 'PHS') {

      terminalType = "携帯";

    } else {
      terminalType = "固定";
    }


  } catch (error) {
    console.log("Error in get terminal type.." + error.message)
  }

  return terminalType;
}


async function getCDRCallSortOutboud(cld, destination, callType) {

  let res = {}, terminalType = "", firstFourDigit = "", firstThreeDigit = "", firstDigit = "", copyTerminalType = '';

  firstFourDigit = cld.substring(0, 4);
  firstThreeDigit = cld.substring(0, 3);
  firstDigit = cld.substring(0, 1);


  if (firstFourDigit == '0035' || firstFourDigit == '0180' || firstFourDigit == '0570' ||
    firstFourDigit == '0990' || firstThreeDigit == '020' || cld == '104' || cld == '110' || cld == '114' ||
    cld == '117' || cld == '188' || cld == '177' || destination == '衛星船舶' || destination == 'ＰＨＳ'
    || destination == 'ＰＨＳ通話' || destination == 'Ｉ　Ｐ' || destination == 'ＩＰ通話' || destination == '他ＩＰ通話') {

    terminalType = 'その他';

  } else if (callType == '国際' && destination == '国際通話') {

    terminalType = 'その他 - Intl';

  } else if ((firstThreeDigit == '070' || firstThreeDigit == '080' || firstThreeDigit == '090') && destination != 'PHS') {

    terminalType = "携帯";

  } else {
    terminalType = "固定";
  }

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


async function roundToFour(num) {
  let res = 0;
  if (num > 0)
    res = +(Math.round(num + "e+4") + "e-4");
  else
    res = num;
  return res;
}
function getYearMonthDay(){
  var dateObj = new Date();
var month = dateObj.getUTCMonth() + 1; //months from 1-12
var day = dateObj.getUTCDate();
var year = dateObj.getUTCFullYear();

return year + "-" + month + "-" + day;
}