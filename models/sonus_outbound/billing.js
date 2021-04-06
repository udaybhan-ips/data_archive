const { formatDiagnostic } = require('typescript');
var config = require('./../../config/config');
var db = require('./../../config/database');

module.exports = {
  getRates: async function() {
      try {
          const query=`select customer_id, landline, mobile from sonus_outbound_rates `;
          const ratesRes= await db.query(query,[]);
          
          if(ratesRes.rows){
              return (ratesRes.rows);              
          }
          return {err:'not found'};
      } catch (error) {
          return error;
      }
  },
  
  deleteTargetDateSummary: async function() {
    try {
        const query=`delete FROM sonus_outbound_summary `;
        const deleteTargetDateSummaryRes= await db.query(query,[]);
        return deleteTargetDateSummaryRes;
    } catch (error) {
        console.log("Err "+ error.message);
        return error;
    }
},
  
updateSummaryData: async function() {

    try {
        
        const getProSummaryQuery=`select billing_comp_code,sum(duration_use) as total_duration , round(sum(mob_amount)) as mob_amount , round(sum(landline_amount)) as landline_amount, billing_comp_name  from cdr_sonus_outbound where start_time >='2021-02-01 00:00:00' and start_time <='2021-02-28 23:59:59' group by billing_comp_name,billing_comp_code order by billing_comp_code`;
        const getProSummaryDataRes= await db.query(getProSummaryQuery,[]);
        let sonusData = getProSummaryDataRes.rows;
        let updateSummaryDataRes=[];
        const query=`insert into cdr_sonus_outbound_summary (invoice_no, customer_name, customer_id, billing_month, billing_year,billing_date,update_date,duration,landline_amt,mobile_amt,total_amt) 
      VALUES ($1, $2, $3, $4, $5,$6, $7, $8, $9, $10, $11) returning id`;

      for(let i=0; i<sonusData.length; i++){
        let valueArray=[];
        valueArray.push(genrateInvoiceNo(sonusData[i].billing_comp_code));
        valueArray.push((sonusData[i].billing_comp_name));
        valueArray.push((sonusData[i].billing_comp_code));
        valueArray.push(('02'));
        valueArray.push(('2021'));
        valueArray.push((sonusData[i].billing_month));
        valueArray.push(('now()'));
        valueArray.push(parseInt(sonusData[i].total_duration,10));
        valueArray.push(parseInt(sonusData[i].landline_amount,10));
        valueArray.push(parseInt(sonusData[i].mob_amount,10));
        valueArray.push(parseInt(sonusData[i].landline_amount,10)+parseInt(sonusData[i].mob_amount,10));
        result= await db.query(query,valueArray);
        updateSummaryDataRes.push(result);
      }
      
        return updateSummaryDataRes;
    } catch (error) {
        console.log("Err "+ error.message);
        return error;
    }
  },
  
}


function genrateInvoiceNo(serviceCode, billDate, billCount){

    return serviceCode + billDateYYYYMM()+'-1';    
}

function billDateYYYYMM(){

  let today = new Date();
  let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
  let yyyy = today.getFullYear();

  return yyyy+mm;
}

