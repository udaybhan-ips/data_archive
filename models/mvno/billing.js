var db = require('./../../config/database');
var utility = require("../../public/javascripts/utility");
module.exports = {
 
  getTargetDate: async function(date_id) {
    try {
          const query=`SELECT max(date_set)::date - interval '1 month' as target_billing_month, max(date_set)::date as current_montth FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
          const targetDateRes= await db.query(query,[]);
          
          if(targetDateRes.rows){
              return  {'target_billing_month' : (targetDateRes.rows[0].target_billing_month),'current_montth':(targetDateRes.rows[0].current_montth)} ;              
          }
          return {err:'not found'};
      } catch (error) {
          return error;
      }
  },
  getAllMVNOCustomer: async function() {
    try {
          const query=`select * from mvno_customer  where deleted=false order by customer_id, did`;

          const getAllMVNOCustRes= await db.queryIBS(query,[]);
          if(getAllMVNOCustRes.rows){
              return  getAllMVNOCustRes.rows;
            }
          return {err:'not found'};
      } catch (error) {
          console.log("Err "+ error.message);
          return error;
      }
  },
  
  deleteSummaryData: async function(customer_name,customer_id,billing_year, billing_month, did) {
    try {
        const query=`delete FROM cdr_mvno_summary where customer_id='${customer_id}' and dnis ='${did}' and customer_name='${customer_name}' and billing_month='${billing_month}' and billing_year='${billing_year}' `;
        const deleteTargetDateSummaryRes= await db.queryIBS(query,[]);
        return deleteTargetDateSummaryRes;
    } catch (error) {
        console.log("Error in delete summary function"+error.message);
        return error;
    }
  },
  
  deleteSummaryDataLeg: async function(customer_name,customer_id,billing_year, billing_month, did, leg) {
    try {
        const query=`delete FROM cdr_mvno_summary where  leg = '${leg}' and customer_name='${customer_name}' and billing_month='${billing_month}' and billing_year='${billing_year}' `;
        const deleteTargetDateSummaryRes= await db.queryIBS(query,[]);
        return deleteTargetDateSummaryRes;
    } catch (error) {
        console.log("Error in delete summary function"+error.message);
        return error;
    }
  },

  createSummaryData: async function(customer_name, customer_id, year, month, did, invoice_no) {
    console.log("summary");
  
    try {
      
        let  getSummaryData = "";

        if(customer_name == 'MEISHIN'){

          getSummaryData=` select sum(duration_use::numeric) as duration ,count(*) as total, sum (CEILING(duration_use::numeric)*.23)as bill,
          '33328230' as dnis  from cdr_202112 where term_ani like  '00328230%' ` ;

        }else{
          getSummaryData=`select dnis, sum(billableseconds)as duration, sum(billableseconds*0.23) as bill, count(*) total from
          calltemp_excel2 where dnis='${did}' and starttime >= '2021-11-30 15:00:00' and starttime <='2021-12-31 14:59:59' group by dnis order by dnis` ;
        }

        

        let sonusDataRows ;
        if(customer_name == 'MEISHIN'){
          sonusDataRows= await db.query(getSummaryData,[]);
        }else{
          sonusDataRows= await db.queryIBS(getSummaryData,[]);
        }

        let sonusData = sonusDataRows.rows;
  
        const query=`insert into cdr_mvno_summary (invoice_no, customer_name, customer_id, 
          billing_month, billing_year,billing_date,update_date,duration,amt, count, dnis) 
        VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11) returning id`;
  
        let valueArray=[];
        valueArray.push(genrateInvoiceNo(customer_id,year,month));
        valueArray.push((customer_name));
        valueArray.push((customer_id));
        valueArray.push(month);
        valueArray.push((year));
        valueArray.push(year+'-'+month+'-01');
        valueArray.push(('now()'));
        valueArray.push(parseInt(sonusData[0].duration,10));
        valueArray.push(parseInt(sonusData[0].bill,10));        
        valueArray.push(parseInt(sonusData[0].total,10));        
        valueArray.push(sonusData[0].dnis);        
    
        const updateSummaryDataRes= await db.queryIBS(query,valueArray);
        return updateSummaryDataRes;
    } catch (error) {
        console.log("Error---"+error.message);
        return error;
    }
  },

  createSummaryDataLeg: async function(customer_name, customer_id, year, month, did, invoice_no, leg) {
    console.log("summary=="+leg);
  
    try {
        
        const getSummaryData=`select count(*) as total, sum(Duration::int) as duration, sum(Call_Charge) as bill from
          CDR_FPHONE where LEG='${leg}'and start_time between '2021/12/01 00:00:00' and '2021/12/31 23:59:59' and 
          Company_Code='${customer_id}' and call_charge !='NaN'` ;

        const sonusDataRows= await db.queryIBS(getSummaryData,[]);
        let sonusData = sonusDataRows.rows;
  
        const query=`insert into cdr_mvno_summary (invoice_no, customer_name, customer_id, 
          billing_month, billing_year,billing_date,update_date,duration,amt, count, dnis, leg) 
        VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11,$12) returning id`;
  
        let valueArray=[];
        valueArray.push(genrateInvoiceNo(customer_id,year,month));
        valueArray.push((customer_name));
        valueArray.push((customer_id));
        valueArray.push(month);
        valueArray.push((year));
        valueArray.push(year+'-'+month+'-01');
        valueArray.push(('now()'));
        valueArray.push(parseInt(sonusData[0].duration,10));
        valueArray.push(parseInt(sonusData[0].bill,10));        
        valueArray.push(parseInt(sonusData[0].total,10));        
        valueArray.push(sonusData[0].dnis);        
        valueArray.push(leg);

        const updateSummaryDataRes= await db.queryIBS(query,valueArray);
        return updateSummaryDataRes;
    } catch (error) {
        console.log("Error---"+error.message);
        return error;
    }
  },
  sendNotification: async function(billingYear, billingMonth){
    let subject = `${billingYear}年${billingMonth}月度 MVNO`;
    let html = `<div>
        <div> Hi Team, </div>
        <div> MVNO billing has been finished, Please check at below link.</div>
        <div>http://10.168.22.40/services/MVNO/</div>
        <div> Thank you </div>
    </div>`;
  
    let mailOption={
        from: 'ips_tech@sysmail.ipsism.co.jp',
        to: 'telecom@ipsism.co.jp',
        cc:'y_ito@ipsism.co.jp,uday@ipsism.co.jp',
       // to:'uday@ipsism.co.jp',
        subject,
        html
    }
  
   utility.sendEmail(mailOption);
  },
    
}


function genrateInvoiceNo(serviceCode, year, month){
  return serviceCode+"-" + year+month+'-1';    
}
