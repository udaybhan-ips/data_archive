var utility= require('../../public/javascripts/utility');
var db = require('./../../config/database');
const  BATCH_SIZE  = 1000000;
const CDR_SONUS_BILLING_CS='cdr_sonus_billing_cs';

var PDFDocument = require("pdfkit");

var fs = require("fs");


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
  
getTargetCDR: async function(year, month) {

    try {
        const query=`SELECT billing_comp_code, term_carrier_id, duration_use, cdr_id  from 
        CDR_SONUS where to_char(start_time, 'MM-YYYY') = '${month}-${year}' and type_of_service='Leafnet_006751'`  ;
        const data= await db.query(query);
        return data.rows;
    } catch (error) {
        return error;
    }
}, 
deleteSummaryData: async function(customer_id,billing_year, billing_month) {
  try {
      const query=`delete FROM cdr_sonus_outbound_summary where customer_id='${customer_id}' and billing_month='${billing_month}' and billing_year='${billing_year}' `;
      const deleteTargetDateSummaryRes= await db.query(query,[]);
      return deleteTargetDateSummaryRes;
  } catch (error) {
      console.log("Error in delete summary function"+error.message);
      return error;
  }
},
createSummaryData: async function(customer_id, year, month) {
  console.log("summary");

  try {
      
      const getSummaryData=`select SUM(FLOOR(total_amount))as total_amount, sum(total_duration) as total_duration  from  
      (select b.Term_Carrier_ID  || '-' || c.Carrier_Name as carrier_name_id, SUM(b.Duration_Use) as total_duration, 
      round(SUM(a.total_amount), 2) as total_amount from CDR_SONUS_BILLING a, CDR_SONUS b, CDR_SONUS_RATE c 
      where a.CDR_ID = b.CDR_ID and a.Rate_ID = c.Rate_ID and to_char(b.start_time, 'MM-YYYY') = '${month}-${year}' 
      group by b.Term_Carrier_ID, c.Carrier_Name )as foo` ;
      const sonusDataRows= await db.query(getSummaryData,[]);
      let sonusData = sonusDataRows.rows;

      const query=`insert into cdr_sonus_outbound_summary (invoice_no, customer_name, customer_id, billing_month, billing_year,billing_date,update_date,duration,landline_amt,mobile_amt,total_amt) 
      VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11) returning id`;

      let valueArray=[];
      valueArray.push(genrateInvoiceNo(customer_id,year,month));
      valueArray.push(('Leafnet'));
      valueArray.push((customer_id));
      valueArray.push(month);
      valueArray.push((year));
      valueArray.push(year+'-'+month+'-01');
      valueArray.push(('now()'));
      valueArray.push(parseInt(sonusData[0].total_duration,10));
      valueArray.push(null);
      valueArray.push(null);
      valueArray.push(parseInt(sonusData[0].total_amount,10));
      

      const updateSummaryDataRes= await db.query(query,valueArray);
      return updateSummaryDataRes;
  } catch (error) {
      console.log("Error---"+error.message);
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
        JSON_data = Object.values(JSON.parse(JSON.stringify(records)));
        chunkArray=chunk(JSON_data,BATCH_SIZE);
    
        for(let i=0;i<chunkArray.length;i++){
            const data = await getNextInsertBatch(chunkArray[i], ipsRates, ratesData);
            res=await db.queryBatchInsertWithoutColumnSet(data,CDR_SONUS_BILLING_CS);
            resArr.push(res);
        }
    }catch(err){
        console.log("Error: "+err.message);
    }
    
    console.log("done"+ new Date());
    console.log(resArr);
    return resArr;

 },  
    genrateInvoice: async function(customerId, billingYear, billingMonth, currentMonth){
      try{
             
       let path = __dirname+`\\Invoice\\Leafnet${billingYear}${billingMonth}.pdf`;

       const invoiceData = await getInvoiceData(billingYear, billingMonth);
       let totalCallAmount = 0;
       invoiceData.map(obj=>{
         totalCallAmount = totalCallAmount + parseInt(obj.total_amount);
       });
      await createInvoice(customerId,billingYear, billingMonth, invoiceData,path,totalCallAmount,currentMonth);
      console.log("Done...")
      }catch(err){
        console.log("error...."+err.message);
      }
       
 },
 sendNotification: async function(customerName, billingYear, billingMonth, currentMonth){
  let subject = `${billingYear}年${billingMonth}月度 LEAFNET（月末）請求書処理のお願い`;
  let html = `<div>
      <div> Hi Team, </div>
      <div> Leafnet billing has been finished, Please check at below link.</div>
      <div>http://billing.toadm.com/services/leafnet/</div>
      <div> Thank you </div>
  </div>`;

  let mailOption={
      from: 'ips_tech@sysmail.ipsism.co.jp',
      to: 'y_ito@ipspro.co.jp,takuya_yamada@ipsism.co.jp,m_asakura@ipspro.co.jp',
      cc:'uday@ipspro.co.jp,jinzai_assistance@ipsism.co.jp',
      subject,
      html
  }

 utility.sendEmail(mailOption);
},
}


async function getInvoiceData(year, month) {
    try {
        const query=`select b.Term_Carrier_ID  || '-' || c.Carrier_Name as carrier_name_id, SUM(b.Duration_Use) as total_duration, 
        round(SUM(a.total_amount), 2) as total_amount from CDR_SONUS_BILLING a, CDR_SONUS b, CDR_SONUS_RATE c
         where a.CDR_ID = b.CDR_ID and a.Rate_ID = c.Rate_ID and to_char(b.start_time, 'MM-YYYY') = '${month}-${year}' 
         group by b.Term_Carrier_ID, c.Carrier_Name order by b.Term_Carrier_ID`;
        const ratesRes= await db.query(query,[]);
        
        if(ratesRes.rows){
            return (ratesRes.rows);              
        }
        
    } catch (error) {
        return error;
    }
}

  async function createInvoice(customerId,billingYear, billingMonth,invoice, path, subTotal,currentMonth) {

    let tax = parseInt(subTotal *.1);
    let totalCallAmount = parseInt(subTotal) + (tax);
    let doc = new PDFDocument({ margin: 50 });
    let MAXY = doc.page.height-50;
    let fontpath = (__dirname+'\\..\\..\\controllers\\font\\ipaexg.ttf');
    doc.font(fontpath);    
    generateHeader(doc, totalCallAmount);
    
    let y = generateCustomerInformation(customerId,billingYear, billingMonth,doc, invoice, 210,currentMonth);

    drawLine(doc, 208);

    addTableHeader(doc, 50, y+30);
    y = customTable(doc , y+30, invoice ,MAXY);
    y = tableSummary(doc,300,y, subTotal);
    generateFooter(doc, y);
    doc.end();
    doc.pipe(fs.createWriteStream(path));
  }

  function tableSummary(doc, x, y, subTotal){

      let tax =  parseInt(subTotal *.1);
      let totalCallAmount = parseInt(subTotal) + (tax);

      doc
      .fontSize(8)
      
      .text(`小合計 (Sub-Total)`, x+50, y+20,{ width: 100 ,align: "left"}) 
      
      .text(`消費税 (Tax)`, x+50, y+35,{ width: 100,align: "left" })
      drawLine(doc, y+48, x+50, 500) 
      .text(`合計 (Total Amount)`, x+50, y+50,{ width: 100, align: "left" } )
      .text(`${utility.numberWithCommas(subTotal)}`, x+100, y+20,{ width: 100 ,align: "right"})    
      .text(`${utility.numberWithCommas(tax)}`, x+100, y+35,{ width: 100, align: "right" })
      .text(utility.numberWithCommas(totalCallAmount), x+100, y+50,{ width: 100 ,align: "right" } )
      .moveDown();
      return y+100;
  }

  function generateHeader(doc,totalCallAmount) {
    doc
     // .image("logo.png", 50, 45, { width: 50 })
      //.fillColor("#444444")
      .fontSize(10)
      .text("株式会社りーふねっと", 50, 57)
      .text("〒105-0001", 50, 70)
      .text("東京都港区虎ノ門1-21-19東急虎ノ門ビル4F", 50, 83)
      .text("プラットフォーム部/プランニングマネージャー", 50, 96)
      .text("杉内 秀啓様", 50, 109)
      .text("株式会社アイ・ピー・エス", 10, 57, { align: "right" })
      .text("〒104－0045", 10, 70, { align: "right" })
      .text("東京都中央区築地4-1-1東劇ビル8階", 10, 83, { align: "right" })
      .text("TEL: 03-3549-7626 FAX : 03-3545-7331", 10, 96, { align: "right" })
      .text("担当: 渡辺 裕史", 10, 109, { align: "right" })
      .text("請 求 書", 0, 142,{ align: "center" })
      .text("Invoice", 0, 150, { align: "center" })

      .text("下記のとおりご請求申し上げます。", 50, 170)
      .text(`ご請求金額合計 (Total Amount):  ${utility.numberWithCommas(totalCallAmount)}`, 50, 170, { align: "right" })
      
      .moveDown();
      
  }

  function generateFooter(doc, y) {
    doc
      .fontSize(8)
      .text(
        "毎度格別のお引き立てをいただきまして、誠にありがとうございます。ご請求を送付させていただきますので、ご査収の上お支払期日までに下記の振込先にお振込いただきますようによろしくお願い申し上げます。なお、誠に勝手ながら銀行振込に係る手数料につきましては、貴社にてご負担いただきますようお願い申し上げます。",
        50,
        y+20,
        { align: "center", width: 500 }
      );
  }

  function row(doc, heigth) {
    doc.lineJoin('miter')
      .rect(33, heigth, 560, 40)
      .stroke()
    return doc
  }

  function customTable (doc , y, data, MAXY){
    
    let height = y ;
    for(let i=0; i< data.length ; i++){ 
        height = height + 20;
        
        textInRowFirst(doc, data[i].carrier_name_id, 50 , height );    
        textInRowFirst(doc, utility.numberWithCommas(parseInt(data[i].total_duration)), 300,  height , "right"  );  
        textInRowFirst(doc, utility.numberWithCommas(parseInt(data[i].total_amount)), 400, height , "right" );  

        if( height >= 680 ){
            doc.addPage({margin: 50})
            height = 50 ;
            addTableHeader(doc, 50, 50 );
            
        }
    }
   return height;
  }

  function addTableHeader(doc,x,y){
    doc
    .fontSize(10)
    .text(`内訳 Detail`, x, y,{ width: 300})    
    .text(`数量 Quantity`, x+250, y,{ width: 100,  align: "right"})
    .text(`金額 Total`, x+350, y,{ width: 100, align: "right" } )
    //.text(`備考 Remarks`, x+400, y,{ width: 100, align: "center" })
     drawLine(doc, y+12)
    .moveDown();
  }

  function textInRowFirst(doc, text, x, heigth, align) {

    doc.y = heigth;
    doc.x = x;
    doc.fontSize(8)
    doc.fillColor('black')
    if(align=='right'){        
        doc.text(text ,{ width: 100, align: "right" })    
    }else{
        doc.text(text )    
    }    
    return doc;
  }


  function generateCustomerInformation(customerId,billingYear, billingMonth,doc, invoice, y, currentMonth) {
    
     const currentYear = new Date(currentMonth).getFullYear();
      let currentMonthValue = new Date(currentMonth).getMonth() + 1;
      if(parseInt(currentMonthValue,10)<10){
        currentMonthValue='0'+currentMonthValue;
      }


    doc
      .text(`お客様コード番号`, 50, y,{ width: 100, align: "center" })    
      .text(`請求書番号`, 150, y,{ width: 100, align: "center"})
      .text(`発行年月日`, 250, y,{ width: 100, align: "center" } )
      .text(`ご請求期間`, 350, y,{ width: 100, align: "center" })
      .text(`お支払期日`, 450, y,{ width: 100, align: "center" })
      
      
      .text(`Customer Code`, 50, y+10,{ width: 100, align: "center" })
      .text(`Invoice Number`, 150, y+10,{ width: 100, align: "center" })
      .text(`Date of Issue`, 250, y+10,{ width: 100, align: "center" } )
      .text(`Billing Period`, 350, y+10,{ width: 100, align: "center" })
      .text(`Due Date`, 450, y+10,{ width: 100, align: "center" })
       drawLine(doc, y+22)
      .fontSize(8)
      .text(`${customerId}`, 50, y+25,{ width: 100, align: "center" })
      .text(`${customerId}-${billingYear}${billingMonth}-1`, 150, y+25,{ width: 100, align: "center" })
      .text(`${billingYear}/${billingMonth}/01`, 250, y+25,{ width: 100, align: "center" } )
      .text(`${billingYear}/${billingMonth}/01～ ${billingYear}/${billingMonth}/${daysInMonth(billingMonth, billingYear)}`, 350, y+25,{ width: 100, align: "center" })
      .text(`${currentYear}/${currentMonthValue}/${daysInMonth(currentMonthValue, currentYear)}`, 450, y+25,{ width: 100, align: "center" })

      //row(doc, 200)    
      .moveDown();      
      return y+25;
  }

  function drawLine(doc,startX, Y=50, Z=550){
    doc 
    .moveTo(Y,startX)                            // set the current point
    .lineTo(Z, startX)                            // draw a line
    .stroke();   
    return doc;                                // stroke the path
  }


  

async function  getRates(companyCode, carrierCode, ratesData){

    let resData=[];
    try{
        for (let i=0; i < ratesData.length; i++){
            if(carrierCode && companyCode) {  
                if( ratesData[i]['carrier_code'] == carrierCode &&  ratesData[i]['company_code'] == companyCode){
                    resData['rateId'] = ratesData[i]['rate_id'];
                    resData['rateSetup'] = ratesData[i]['rate_setup'];
                    resData['rateSecond'] = ratesData[i]['rate_second'];
                    break;
                 }
            }else if(companyCode){
                if(ratesData[i]['company_code'] == companyCode){
                    resData['rateId'] = ratesData[i]['rate_id'];
                    resData['rateSetup'] = ratesData[i]['rate_setup'];
                    resData['rateSecond'] = ratesData[i]['rate_second'];
                    break;
                 }
            }
        }
    }catch(err){
        console.log("Error "+err.message);
        return err;
    }
  return resData;
}





async function getNextInsertBatch(data, ipsRates, ratesData) {
    
    let valueArray=[];

    try {
     for(let i=0;i<data.length;i++){
       
       let obj={};
       if(data[i]['term_carrier_id']=='2GSX' || data[i]['term_carrier_id']=='AN,0'){
        data[i]['term_carrier_id']='5039';
       }

       const rates = await getRates( data[i]['billing_comp_code'], data[i]['term_carrier_id'] , ratesData);

     //  console.log("rates=="+(rates));
       //console.log("rates Id=="+(rates['rateId']));

       const blegCallAmount = parseFloat(rates['rateSetup']) + ( parseFloat(data[i]['duration_use']) * parseFloat(rates['rateSecond']));
       const ipsCallAmount = parseFloat(ipsRates['rateSetup']) + (parseFloat(data[i]['duration_use']) * parseFloat(ipsRates['rateSecond']));
       const totalCallAmount = (ipsCallAmount + blegCallAmount).toFixed(2) ;
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




function genrateInvoiceNo(serviceCode, year, month, billCount){

    return serviceCode+"-" + year+month+'-1';    
}

function billDateYYYYMM(){

  let today = new Date();
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();

  return yyyy+mm;
}


function daysInMonth (month, year) {
  return new Date(year, month, 0).getDate();
}


