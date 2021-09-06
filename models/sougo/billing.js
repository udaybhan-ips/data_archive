var utility = require('../../public/javascripts/utility');
var db = require('./../../config/database');
var PDFDocument = require("pdfkit");
var fs = require("fs");


module.exports = {
  getRates: async function () {
    try {
      const query = `select company_code, date_start, date_expired, rate_setup, rate_second, rate_trunk_port from rate`;
      const ratesRes = await db.queryIBS(query, []);

      // console.log("ratesRes="+JSON.stringify(ratesRes.rows));

      if (ratesRes.rows) {
        // console.log("if")
        return (ratesRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get rates =" + error.message);
      return error;
    }
  },
  getCarrierInfo: async function () {
    try {
      const query = `select carrier_code, carrier_name from carrier `;
      const carrierRes = await db.queryIBS(query, []);
      if (carrierRes.rows) {
        return (carrierRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in carrier info =" + error.message);
      return error;
    }
  },
  getBillNoInfo: async function () {
    try {
      const query = `select max(bill_no) as max_bill_no from bill_history `;
      const billNoRes = await db.queryIBS(query, []);
      if (billNoRes.rows) {
        return { 'max_bill_no': (billNoRes.rows[0].max_bill_no)};
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in bill no info =" + error.message);
      return error;
    }
  },
  getAllCompCode: async function () {
    try {
      console.log("in get all comp code");
      const query = `select distinct(company_code) as company_code from billcdr_main  `;
      const billNoRes = await db.queryIBS(query, []);
      
      return billNoRes.rows;

    } catch (error) {
      console.log("err in getting company code =" + error.message);
      return error;
    }
  },


  getTargetDate: async function (date_id) {
    try {
      const query = `SELECT max(date_set)::date - interval '1 month' as target_billing_month, max(date_set)::date as current_montth FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
      const targetDateRes = await db.query(query, []);
      //console.log(targetDateRes);
      if (targetDateRes.rows) {
        return { 'target_billing_month': (targetDateRes.rows[0].target_billing_month), 'current_montth': (targetDateRes.rows[0].current_montth) };
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("err in get target cdr =" + error.message);
      return error;
    }
  },

  getTargetCDR: async function (company_code) {

    
    try {
      query = `select count(*) as total_calls, sum(duration) as total_duration , carrier_code, term_carrier_id 
          from billcdr_main where duration>1 and company_code='${company_code}' group by    carrier_code, term_carrier_id 
          order by   carrier_code, term_carrier_id `;

      console.log("query==" + query);
      const data = await db.queryIBS(query);
      
      return data.rows;
    } catch (error) {
      console.log("error in get cdr data="+error.message);
      return error;
    }
  },
  
  
  createDetailData: async function (bill_no, company_code, year, month, ratesDetails, data, carrierInfo) {
    console.log("details ");
    try {

      let call_count = 0;
      let duration = 0 ;
      let amount = 0 ;
      let billAmount = 0;
      let tax = 0;

      for(let i=0; i<data.length;i++){
        let info = await getResInfo(data[i], company_code, ratesDetails, carrierInfo,month);
            for (let ii=0;ii<info.length;ii++) {

              call_count = call_count + parseInt(info[ii]['call_count'],10);
              duration =  duration + parseInt(info[ii]['call_sec'],10);
              if(parseInt(info[ii]['amount'],10)>1){
                amount = amount + parseInt(info[ii]['amount'],10);
              }
              

              let query = `insert into bill_detail (bill_no,line_no, item_type , item_name, call_count, call_sec,rate,
                amount, remarks, date_update, name_update, date_insert, name_insert) VALUES('${bill_no}', '${info[ii]['line_no']}', 
                '${info[ii]['item_type']}', '${info[ii]['item_name']}',${info[ii]['call_count']}, ${info[ii]['call_sec']}, ${info[ii]['rate']} 
                ,${info[ii]['amount']},'${info[ii]['remarks']}','now()','system', 'now()','system')`;
      
              console.log("query==" + query);
              let insertBillingdetailsRes = await db.queryIBS(query, []);
            }
      }

      if(amount>0){
        tax = amount * .1;
        billAmount = amount + tax;
      }

      let query = `insert into bill_history (bill_no , company_code , date_bill , date_payment , bill_term_start , bill_term_end , bill_period ,
         amount , tax ,print_flag , date_insert , name_insert , date_update , name_update , bill_include ,call_count) VALUES('${bill_no}', '${company_code}', '${year}-${month}-01', '${year}-${month}-25','${year}-${month}-01', '${year}-${month}-30',
         '1' ,'${amount}','${tax}','0','now()','System','now()','System', '0','${call_count}')`;
      console.log("query==" + query);

      let insertHisDataFC = await db.queryIBS(query, []);
   

      



    } catch (error) {
      console.log("Error in result ---" + error.message);
      return error;
    }
  },

  genrateInvoice: async function (company_code, billingYear, billingMonth, currentMonth) {
    try {

      let path = __dirname + `\\Invoice\\${company_code}${billingYear}${billingMonth}.pdf`;

      const invoiceData = await getInvoiceData(company_code, billingYear, billingMonth);
      const customerAddress = await getCustomerInfo(company_code);
      let totalCallAmount = 0;
      let totalCallDuration =0;

      invoiceData.map(obj => {
          totalCallAmount = totalCallAmount + parseInt(obj.amount);
          totalCallDuration = totalCallDuration + parseInt(obj.call_sec);
      });
      await createInvoice(company_code, billingYear, billingMonth, invoiceData, path, totalCallAmount, currentMonth, customerAddress,totalCallDuration);
      console.log("Done...")
    } catch (err) {
      console.log("error...." + err.message);
    }

  },
  sendNotofication: async function (customerName, billingYear, billingMonth, currentMonth) {
    let subject = `Approval Notification for ${reqData.customer_name} of ${utility.dateVsMonths[reqData.billing_month]}`;
    let html = `<div>
      <div> Hi Team, </div>
      <div> Below is the billing status of ${reqData.customer_name} Sonus Outbound. This is approved by ${reqData.approved_by}.</div>
      <div> Thank you </div>
  </div>`;

    let mailOption = {
      from: 'ips_tech@sysmail.ipsism.co.jp',
      to: 'uday@ipsism.co.jp',
      //cc:'r_chong@ipsism.co.jp,y_ito@ipsism.co.jp',
      subject,
      html
    }

    utility.sendEmail(mailOption);
  },
}





async function getResInfo(data,company_code, ratesInfo, carrierInfo, billingMonth) {

  console.log("company_code==" + company_code);
  console.log("carrier_code==" + data['carrier_code']);
  console.log("term_carrier_id==" + data['term_carrier_id']);


  let res = [], case1 = {}, case2 = {}, case3 = {}, case4 = {}, case5 = {}, case6 = {};
  try {

    let rate = await getSougoRates(ratesInfo, company_code);
    let carrierName = await getCarrierName(carrierInfo, data['carrier_code']);
    let termCarrierName = await getCarrierName(carrierInfo, data['term_carrier_id']);

    case1['call_count'] = data['total_calls'];
    case1['line_no'] = 1;
    case1['item_type'] = 1;
    case1['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 通話回数（国内）";
    case1['call_sec'] = data['total_calls'];
    case1['amount'] = data['total_calls'] * rate['rate_setup'];
    case1['rate'] = rate['rate_setup'];
    case1['remarks'] = termCarrierName  + "-" + data['term_carrier_id'] +"着信 " + billingMonth + "月分";

    case2['call_count'] = 0;
    case2['line_no'] = 2;
    case2['item_type'] = 2;
    case2['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 通話秒数（国内）";
    case2['call_sec'] = data['total_duration'];
    case2['amount'] = data['total_duration'] * rate['rate_sec'];
    case2['rate'] = rate['rate_sec'];
    case2['remarks'] = termCarrierName + "-" + data['term_carrier_id'] +"着信 " + billingMonth + "月分";


    case3['call_count'] = data['total_duration'];
    case3['line_no'] = 3;
    case3['item_type'] = 3;
    case3['item_name'] = data['carrier_code'] + "-" + carrierName +"発信分 ﾄﾗﾝｸﾎﾟｰﾄ接続料（国内）";
    case3['call_sec'] = data['total_duration'];
      case3['amount'] = rate['rate_trunk_port'] *  data['total_duration'];
      case3['rate'] = rate['rate_trunk_port'];
    
    case3['remarks'] = termCarrierName + "-" + data['term_carrier_id'] +"着信 "+ billingMonth + "月分";

    case4['call_count'] =0;
    case4['line_no'] = 4;
    case4['item_type'] = 1;
    case4['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 通話回数（国際）"
    case4['call_sec'] = 0;
    case4['amount'] =0 * rate['rate_setup'];
    case4['rate'] = rate['rate_setup'];
    case4['remarks'] = termCarrierName + "-" + data['term_carrier_id'] + "着信" + billingMonth + "月分";

    case5['call_count'] = 0;
    case5['line_no'] = 5;
    case5['item_type'] = 2;
    case5['item_name'] = data['carrier_code'] + "-" + carrierName +"発信分 通話秒数（国際）";
    case5['call_sec'] = 0;
    case5['amount'] = 0 * rate['rate_sec'];
    case5['rate'] = rate['rate_sec'];
    case5['remarks'] = termCarrierName + "-" + data['term_carrier_id'] + "着信" + billingMonth + "月分";


    case6['call_count'] = 0;
    case6['line_no'] = 6;
    case6['item_type'] = 3;
    case6['item_name'] = data['carrier_code'] + "-" + carrierName + "発信分 ﾄﾗﾝｸﾎﾟｰﾄ接続料（国際）";
    case6['call_sec'] = 0;
    case6['amount'] = 0;
    case6['rate'] = rate['rate_trunk_port'];
    case6['remarks'] = termCarrierName + "-" + data['term_carrier_id'] + "着信" +  billingMonth + "月分";

    res.push(case1);
    
    res.push(case3);
    res.push(case2);
    res.push(case4);
    
    res.push(case6);
    res.push(case5);

  } catch (err) {
    console.log("error in get res..." + err.message);
  }

  return res;
}

async function getCarrierName(data, carrier_code) {

  try{
    for (let i = 0; i < data.length; i++) {
      if (data[i]['carrier_code'] == carrier_code) {
        return data[i]['carrier_name'];
      }
    }
    
  }catch(err){
    console.log("err in get carrier name="+err.message)
  }
  
  return "";
}



async function getSougoRates(data, company_code) {
  let res = {};

  console.log("comp code=="+company_code);
  console.log("data=="+data.length);

  try{
    for (let i = 0; i < data.length; i++) {
      if (data[i]['company_code'] == company_code) {
        res['rate_setup'] = data[i]['rate_setup'];
        res['rate_sec'] = data[i]['rate_second'];
        res['rate_trunk_port'] = data[i]['rate_trunk_port'];
        break;
      }
    }

  }catch(err){
    console.log("error in get rates");
  }
  
  return res;
}


async function getCustomerInfo(company_code) {
  try {
    const query = `select *, (select company_name from company where company_code='${company_code}' limit 1)as company_name  from bill_info where company_code='${company_code}'`;
    const ratesRes = await db.queryIBS(query, [],true);

    if (ratesRes.rows) {
      return (ratesRes.rows);
    }

  } catch (error) {
    return error;
  }
}

async function getInvoiceData(company_code, year, month) {
  try {
    const query = `select * from (select bill_no, item_name, rate, call_sec, amount , remarks from bill_detail where amount>1)as lj join 
    (select bill_no, company_code, date_bill  from bill_history
      where company_code='${company_code}'   and to_char(date_bill, 'MM-YYYY') =  '${month}-${year}') as rj
       on (lj.bill_no=rj.bill_no) order by lj.item_name` ;
    const ratesRes = await db.queryIBS(query, []);

    if (ratesRes.rows) {
      return (ratesRes.rows);
    }

  } catch (error) {
    return error;
  }
}





async function createInvoice(company_code, billingYear, billingMonth, invoice, path, subTotal, currentMonth, address,totalCallDuration) {

  let tax = parseInt(subTotal * .1);
  let totalCallAmount = parseInt(subTotal) + (tax);
  let doc = new PDFDocument({ margin: 50 });
  let MAXY = doc.page.height - 50;
  let fontpath = (__dirname + '\\..\\..\\controllers\\font\\ipaexg.ttf');
  doc.font(fontpath);
  await generateHeader(address,doc, totalCallAmount);

  let y = generateCustomerInformation(company_code, billingYear, billingMonth, doc, invoice, 200, currentMonth,totalCallAmount);

  drawLine(doc, 198);

  
  console.log("y=--"+y);
  addTableHeaderFC(doc, 50, y + 30, totalCallAmount,totalCallDuration, billingYear, billingMonth);
  y = customTableFC(doc, y + 55, invoice, MAXY);
  
  y = tableSummary(doc, 350, y, subTotal);
  generateFooter(doc, y);
  doc.end();
  doc.pipe(fs.createWriteStream(path));
}

function tableSummary(doc, x, y, subTotal) {

  let tax = parseInt(subTotal * .1);
  let totalCallAmount = parseInt(subTotal) + (tax);

  doc
    .fontSize(8)

    .text(`小合計 (Sub-Total)`, x + 50, y + 20, { width: 100, align: "left" })

    .text(`消費税 (Tax)`, x + 50, y + 35, { width: 100, align: "left" })
  drawLine(doc, y + 48, x + 50, 500)
    .text(`合計 (Total Amount)`, x + 50, y + 50, { width: 100, align: "left" })
    .text(`${utility.numberWithCommas(subTotal)}`, x + 100, y + 20, { width: 100, align: "right" })
    .text(`${utility.numberWithCommas(tax)}`, x + 100, y + 35, { width: 100, align: "right" })
    .text(utility.numberWithCommas(totalCallAmount), x + 100, y + 50, { width: 100, align: "right" })
    .moveDown();
  return y + 100;
}

async function generateHeader(customerDetails, doc, totalCallAmount) {

  let postNumber = customerDetails[0]['zip_code'];
  let customerName = customerDetails[0]['company_name'];
  let address = customerDetails[0]['address1'] + customerDetails[0]['address2'] ;

  doc
    // .image("logo.png", 50, 45, { width: 50 })
    //.fillColor("#444444")
    .fontSize(10)
    .text(`〒${postNumber}`, 50, 57)
    .text(`${address}`, 50, 70)
    .text(`${customerName}`, 50, 83)
    
    .text("株式会社アイ・ピー・エス", 10, 57, { align: "right" })
    .text("〒104－0045", 10, 70, { align: "right" })
    .text("東京都中央区築地4-1-1東劇ビル8階", 10, 83, { align: "right" })
    .text("TEL: 03-3549-7626 FAX : 03-3545-7331", 10, 96, { align: "right" })
    

    .text("ご 利 用 明 細 書", 0, 142, { align: "center" })
    

    // .text("下記のとおりご請求申し上げます。", 50, 170)
    // .text(`ご請求金額合計 (Total Amount):  ${utility.numberWithCommas(totalCallAmount)}`, 50, 170, { align: "right" })

    .moveDown();

}

function generateFooter(doc, y) {
  doc
    .fontSize(8)
    .text("※この書類は㈱IPSから御社にお支払いする手数料についての通知書です。",50, y + 20,{ align: "left", width: 500 })
    .text("内容をご確認の上、請求書を上記住所までご送付くださいますようお願いいたします。",50, y + 30,{ align: "left", width: 500 })
    .text("This serves as the notice of commission details to be paid by IPS to your company.",50, y + 40,{ align: "left", width: 500 })
    .text("Kindly issue to IPS an invoice statement upon receipt of this notice by sending to address above.",50, y + 50,{ align: "left", width: 500 })
}

function row(doc, heigth) {
  doc.lineJoin('miter')
    .rect(33, heigth, 560, 40)
    .stroke()
  return doc
}

function customTableFC(doc, y, data, MAXY) {
  console.log("in table FC");
  let height = y;
  for (let i = 0; i < data.length; i++) {
    height = height + 20;
    textInRowFirst(doc, i+1, 50, height);
    textInRowFirst(doc, data[i].item_name, 75, height);
    textInRowFirst(doc, data[i].rate, 200, height, "right");
    textInRowFirst(doc, utility.numberWithCommas(parseInt(data[i].call_sec)), 275, height, "right");
    textInRowFirst(doc, utility.numberWithCommas(parseInt(data[i].amount)), 330, height, "right");
    textInRowFirst(doc, (data[i].remarks), 450, height, "right");
   // textInRowFirst(doc, utility.numberWithCommas(parseInt(data[i].total_amount)), 400, height, "right");

    if (height >= 680) {
      doc.addPage({ margin: 50 })
      height = 50;
      //addTableHeader(doc, 50, 50);

    }
  }
  return height;
}

function addTableHeader(doc, x, y,totalAmount, totalCallDuration, billingYear, billingMonth) {
  console.log("y---"+y);

  doc
  .fontSize(10)
  .text(`サービス品目`, 50, y, { width: 100, align: "center" })
  .text(`手数料種類`, 150, y, { width: 100, align: "center" })
  .text(`着信時間（分数）`, 250, y, { width: 100, align: "center" })
  .text(`ご請求期間`, 350, y, { width: 100, align: "center" })
  .text(`手数料`, 450, y, { width: 100, align: "center" })


  .text(`SERVICE ITEM`, 50, y + 10, { width: 100, align: "center" })
  .text(`COMMISSION TYPE`, 150, y + 10, { width: 100, align: "center" })
  .text(`TIME (MIN)`, 250, y + 10, { width: 100, align: "center" })
  .text(`PERIOD`, 350, y + 10, { width: 100, align: "center" })
  .text(`COMMISSION FEE`, 450, y + 10, { width: 100, align: "center" })
drawLine(doc, y)
  .fontSize(8)
  .text(`音声着信サービス`, 50, y + 25, { width: 100, align: "center" })
  .text(`1ヶ月間の累積着信分数`, 150, y + 25, { width: 100, align: "center" })
  .text(`${totalCallDuration}`, 250, y + 25, { width: 100, align: "center" })
  .text(`${billingYear}/${billingMonth}/1 ～ ${billingYear}/${billingMonth}/${daysInMonth(billingMonth, billingYear)}`, 350, y + 25, { width: 100, align: "center" })
  .text(`${utility.numberWithCommas(totalAmount)}`, 450, y + 25, { width: 100, align: "center" })

  .text(`Voice Receiver Service`, 50, y + 37, { width: 100, align: "center" })
  .text(`1 Month(s) Accumulative`, 150, y + 37, { width: 100, align: "center" })

  drawLine(doc, y + 22)
    .moveDown();
}

function addTableHeaderFC(doc, x, y,totalAmount, totalCallDuration, billingYear, billingMonth) {
  console.log("y---"+y);

  doc
  .fontSize(10)
  .text(`No.`, 50, y, { width: 25, align: "center" })
  .text(`内訳 (DETAILS) `, 75, y, { width: 175, align: "center" })
  .text(`単価 (PRICE)`, 250, y, { width: 75, align: "center" })
  .text(`数量 (QUANTITY)`, 325, y, { width: 60, align: "center" })
  .text(`金額 (TOTAL)`, 385, y, { width: 60, align: "center" })
  .text(`備考 (REMARKS)`, 445, y, { width: 105, align: "center" })
  
drawLine(doc, y)
drawLine(doc, y+23)
    .moveDown();
}


function textInRowFirst(doc, text, x, heigth, align) {

  doc.y = heigth;
  doc.x = x;
  doc.fontSize(8)
  doc.fillColor('black')
  if (align == 'right') {
    doc.text(text, { width: 100, align: "right" })
  } else {
    doc.text(text)
  }
  return doc;
}


function generateCustomerInformation(company_code, billingYear, billingMonth, doc, invoice, y, currentMonth, totalAmount) {

  const currentYear = new Date(currentMonth).getFullYear();
  let currentMonthValue = new Date(currentMonth).getMonth() + 1;
  if (parseInt(currentMonthValue, 10) < 10) {
    currentMonthValue = '0' + currentMonthValue;
  }


  doc
    .text(`お客様コード番号`, 50, y, { width: 100, align: "center" })
    .text(`請求書番号`, 150, y, { width: 100, align: "center" })
    .text(`発行年月日`, 250, y, { width: 100, align: "center" })
    .text(`ご請求期間`, 350, y, { width: 100, align: "center" })
    .text(`お支払期限`, 450, y, { width: 100, align: "center" })


    .text(`Customer Code`, 50, y + 10, { width: 100, align: "center" })
    .text(`Invoice Number`, 150, y + 10, { width: 100, align: "center" })
    .text(`Date of Issue`, 250, y + 10, { width: 100, align: "center" })
    .text(`Billing Period`, 350, y + 10, { width: 100, align: "center" })
    .text(`PAYMENT DUE DATE`, 450, y + 10, { width: 100, align: "center" })
  drawLine(doc, y + 22)
    .fontSize(8)
    .text(`${company_code}`, 50, y + 25, { width: 100, align: "center" })
    .text(`${company_code}-${billingYear}${billingMonth}-1`, 150, y + 25, { width: 100, align: "center" })
    .text(`${billingYear}/${billingMonth}/01`, 250, y + 25, { width: 100, align: "center" })
    .text(`${billingYear}/${billingMonth}/1 ～ ${billingYear}/${billingMonth}/${daysInMonth(billingMonth, billingYear)}`, 350, y + 25, { width: 100, align: "center" })
    .text(`${billingYear}/${billingMonth}/30`, 450, y + 25, { width: 100, align: "center" })

    //row(doc, 200)    
    .moveDown();
  return y + 35;
}

function drawLine(doc, startX, Y = 50, Z = 550) {
  doc
    .moveTo(Y, startX)                            // set the current point
    .lineTo(Z, startX)                            // draw a line
    .stroke();
  return doc;                                // stroke the path
}




function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}


