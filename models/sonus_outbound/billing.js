var db = require('./../../config/database');
var utility = require("../../public/javascripts/utility");
module.exports = {

  getTargetDate: async function (date_id) {
    try {
      const query = `SELECT max(date_set)::date - interval '1 month' as target_billing_month, max(date_set)::date as current_montth FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
      const targetDateRes = await db.query(query, []);

      if (targetDateRes.rows) {
        return { 'target_billing_month': (targetDateRes.rows[0].target_billing_month), 'current_montth': (targetDateRes.rows[0].current_montth) };
      }
      return { err: 'not found' };
    } catch (error) {
      return error;
    }
  },
  getAllSonusOutboundCustomer: async function (customerId) {
    try {
      
      if (customerId) {
        where = ` customer_id= '${customerId}' and deleted= false `;
      } else {
        where = ` deleted = false  `;
      }

      const query = `select details_invoice, customer_id, landline as landline_rate, mobile as mobile_rate from sonus_outbound_rates where 
      customer_id in (select customer_cd from m_customer where service_type ->>'sonus_outbound' =  'true') 
      and ${where} 
      order by customer_id`;
      const getAllSonusOutboundCustRes = await db.query(query, [], true);
      if (getAllSonusOutboundCustRes.rows) {
        return getAllSonusOutboundCustRes.rows;
      }
      return { err: 'not found' };
    } catch (error) {
      console.log("Err " + error.message);
      return error;
    }
  },


  deleteDetailData: async function (customer_id, billing_year, billing_month) {
    try {
      const query = `delete FROM cdr_sonus_outbound_details where customer_id='${customer_id}' and billing_month='${billing_month}' 
      and billing_year='${billing_year}' `;
      const deleteTargetDateDetailRes = await db.query(query, []);
      return deleteTargetDateDetailRes;
    } catch (error) {
      console.log("Error in delete detail function" + error.message);
      return error;
    }
  },
  createDetailData: async function (customer_id, year, month, landLineRate, mobileRate) {
    console.log("summary");

    try {

      // let landLineRate = '0.06';
      // let mobileRate = '0.115';

      // if(customer_id == '00001226'){
      //    landLineRate = '0.05';
      //    mobileRate = '0.15';
      // }

      const getDetailData = `select orig_ani, sum( case when ( left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR 
        left(sonus_egcallednumber,2)='90' ) then 1 else 0 end) as mobile_count,
        sum( case when ( left(sonus_egcallednumber,2)='70' OR  left(sonus_egcallednumber,2)='80' OR left(sonus_egcallednumber,2)='90' ) 
        then 0 else 1 end) as landline_count,
        sum( case when ( left(sonus_egcallednumber,2)='70' OR  left(sonus_egcallednumber,2)='80' OR left(sonus_egcallednumber,2)='90' ) 
        then duration else 0 end) as mobile_duration,
        sum( case when ( left(sonus_egcallednumber,2)='70' OR  left(sonus_egcallednumber,2)='80' OR left(sonus_egcallednumber,2)='90' ) 
        then 0 else duration end) as landline_duration,
        sum( case when ( left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR left(sonus_egcallednumber,2)='90' ) 
        then duration*${mobileRate} else 0 end) as mob_amount,
        sum( case when ( left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR left(sonus_egcallednumber,2)='90' ) 
        then 0 else duration*${landLineRate} end) as landline_amount,
        billing_comp_code from cdr_sonus_outbound
        where to_char(start_time, 'MM-YYYY') = '${month}-${year}' and billing_comp_code='${customer_id}' 
        group by billing_comp_code, orig_ani order by orig_ani` ;

      const sonusDetailDataRows = await db.query(getDetailData, []);
      let sonusData = sonusDetailDataRows.rows;

      const query = `insert into cdr_sonus_outbound_details (invoice_no,  customer_id, 
          billing_month, billing_year,billing_date,update_date,mobile_count, landline_count, total_count,mobile_duration, landline_duration, 
          duration,mobile_amt, landline_amt,total_amt, did_number) 
        VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11,$12, $13, $14, $15, $16) returning id`;
        let updateSummaryDataRes = [];

        for(let i=0; i< sonusData.length ; i++){
          let valueArray = [];
          valueArray.push(genrateInvoiceNo(customer_id, year, month));
          //valueArray.push((customer_name));
          valueArray.push((customer_id));
          valueArray.push(month);
          valueArray.push((year));
          valueArray.push(year + '-' + month + '-01');
          valueArray.push(('now()'));
    
          valueArray.push((sonusData[i].mobile_count));
          valueArray.push((sonusData[i].landline_count));
          valueArray.push(parseFloat(sonusData[i].mobile_count) + parseFloat(sonusData[i].landline_count));
    
          valueArray.push((sonusData[i].mobile_duration));
          valueArray.push((sonusData[i].landline_duration));
          valueArray.push(parseFloat(sonusData[i].mobile_duration) + parseFloat(sonusData[i].landline_duration));
    
          valueArray.push((sonusData[i].mob_amount));
          valueArray.push((sonusData[i].landline_amount));
          valueArray.push(parseFloat(sonusData[i].mob_amount) + parseFloat(sonusData[i].landline_amount));
          valueArray.push(sonusData[i].orig_ani);

          const updateSummaryDataRes = await db.query(query, valueArray);
        }

      
      return updateSummaryDataRes;
    } catch (error) {
      console.log("Error---" + error.message);
      return error;
    }
  },


  deleteSummaryData: async function (customer_id, billing_year, billing_month) {
    try {
      const query = `delete FROM cdr_sonus_outbound_summary where customer_id='${customer_id}' and billing_month='${billing_month}' 
      and billing_year='${billing_year}' `;
      const deleteTargetDateSummaryRes = await db.query(query, []);
      return deleteTargetDateSummaryRes;
    } catch (error) {
      console.log("Error in delete summary function" + error.message);
      return error;
    }
  },
  createSummaryData: async function (customer_id, year, month, landLineRate, mobileRate) {
    console.log("summary");

    try {

      // let landLineRate = '0.06';
      // let mobileRate = '0.115';

      // if(customer_id == '00001226'){
      //    landLineRate = '0.05';
      //    mobileRate = '0.15';
      // }

      const getSummaryData = `select sum( case when ( left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR 
        left(sonus_egcallednumber,2)='90' ) then 1 else 0 end) as mobile_count,
        sum( case when ( left(sonus_egcallednumber,2)='70' OR  left(sonus_egcallednumber,2)='80' OR left(sonus_egcallednumber,2)='90' ) 
        then 0 else 1 end) as landline_count,
        sum( case when ( left(sonus_egcallednumber,2)='70' OR  left(sonus_egcallednumber,2)='80' OR left(sonus_egcallednumber,2)='90' ) 
        then duration else 0 end) as mobile_duration,
        sum( case when ( left(sonus_egcallednumber,2)='70' OR  left(sonus_egcallednumber,2)='80' OR left(sonus_egcallednumber,2)='90' ) 
        then 0 else duration end) as landline_duration,
        sum( case when ( left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR left(sonus_egcallednumber,2)='90' ) 
        then duration*${mobileRate} else 0 end) as mob_amount,
        sum( case when ( left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR left(sonus_egcallednumber,2)='90' ) 
        then 0 else duration*${landLineRate} end) as landline_amount,
        billing_comp_code from cdr_sonus_outbound
        where to_char(start_time, 'MM-YYYY') = '${month}-${year}' and billing_comp_code='${customer_id}' 
        group by billing_comp_code` ;

      const sonusDataRows = await db.query(getSummaryData, []);
      let sonusData = sonusDataRows.rows;

      const query = `insert into cdr_sonus_outbound_summary (invoice_no,  customer_id, 
          billing_month, billing_year,billing_date,update_date,mobile_count, landline_count, total_count,mobile_duration, landline_duration, 
          duration,mobile_amt, landline_amt,total_amt) 
        VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11,$12, $13, $14, $15) returning id`;

      let valueArray = [];
      valueArray.push(genrateInvoiceNo(customer_id, year, month));
      //valueArray.push((customer_name));
      valueArray.push((customer_id));
      valueArray.push(month);
      valueArray.push((year));
      valueArray.push(year + '-' + month + '-01');
      valueArray.push(('now()'));

      valueArray.push(parseInt(sonusData[0].mobile_count, 10));
      valueArray.push(parseInt(sonusData[0].landline_count, 10));
      valueArray.push(parseInt(sonusData[0].mobile_count, 10) + parseInt(sonusData[0].landline_count, 10));

      valueArray.push(parseInt(sonusData[0].mobile_duration, 10));
      valueArray.push(parseInt(sonusData[0].landline_duration, 10));
      valueArray.push(parseInt(sonusData[0].mobile_duration, 10) + parseInt(sonusData[0].landline_duration, 10));

      valueArray.push(parseInt(sonusData[0].mob_amount, 10));
      valueArray.push(parseInt(sonusData[0].landline_amount, 10));
      valueArray.push(parseInt(sonusData[0].mob_amount, 10) + parseInt(sonusData[0].landline_amount, 10));



      const updateSummaryDataRes = await db.query(query, valueArray);
      return updateSummaryDataRes;
    } catch (error) {
      console.log("Error---" + error.message);
      return error;
    }
  },
  sendNotification: async function (billingYear, billingMonth) {
    let subject = `${billingYear}年${billingMonth}月度 SONUS OUTBOUND`;
    let html = `<div>
        <div> Hi Team, </div>
        <div> SONUS OUTBOUND billing has been finished, Please check at below link.</div>
        <div>http://billing.toadm.com/services/sonusoutbound/</div>
        <div> Thank you </div>
    </div>`;

    let mailOption = {
      from: 'ips_tech@sysmail.ipsism.co.jp',
      to: 'telecom@ipspro.co.jp',
      cc: 'y_ito@ipspro.co.jp,uday@ipspro.co.jp',
      // to:'uday@ipsism.co.jp',
      subject,
      html
    }

    utility.sendEmail(mailOption);
  },

}


function genrateInvoiceNo(serviceCode, year, month) {
  return serviceCode + "-" + year + month + '-1';
}

