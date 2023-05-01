var db = require('../../config/database');
var utility = require('../../public/javascripts/utility');


module.exports = {

  

  createDMSBillingData: async function ({ year, month, comp_code, payment_plan_date, createdBy }) {

    let billNo = 1000;
    const getNumberOfDaysInMonth = utility.daysInMonth(month, year);

    
      if (comp_code == undefined || comp_code == '') {
        throw new Error('Invalid Request')
      }

      const checkQuery = `select * from dms_billing_history where customer_code='${comp_code}' and bill_term_start::date ='${year}-${month}-01' `;
      const resCheckQuery = await db.queryIBS(checkQuery, []);
      if (resCheckQuery && resCheckQuery.rows && resCheckQuery.rows.length > 0) {
        throw new Error('Data already there!!')
      }

      const query = `  select * from dms_prefix where customer_cd = '${comp_code}' `;
      const dmsPrefix = await db.query(query, [], true);

      if (dmsPrefix && dmsPrefix.rows && dmsPrefix.rows.length <= 0) {
        throw new Error("DMS prefix is not defined!!!")
      }

      const dmsRate = `  select * from rate_dms where company_code ='${comp_code}' and deleted =false `;
      const dmsRateRes = await db.queryIBS(dmsRate, []);

      if (dmsRateRes && dmsRateRes.rows && dmsRateRes.rows.length <= 0) {
        throw new Error("DMS rate is not defined!!!")
      }


      try {

      const getBillNoQuery = `select max(bill_no) as max_bill_no from dms_billing_history `;
      const billNoRes = await db.queryIBS(getBillNoQuery, []);
      if (billNoRes.rows && billNoRes.rows.length > 0 && billNoRes.rows[0].max_bill_no !== null && billNoRes.rows[0].max_bill_no !== 'null') {
        billNo = parseInt(billNoRes.rows[0].max_bill_no, 10) + 1;
      }




      let where = "";

      for (let ii = 0; ii < dmsPrefix.rows.length; ii++) {
        where += `sonus_incallednumber ilike '${dmsPrefix.rows[ii]['prefix']}%' OR `;
      }

      if (where !== '') {
        where = where.slice(0, -3);
      }

      let res = [];
      let  totalMobileAmount =0 ,totalLandLineAmount =0,   totalMobileDuration=0, totalLandlineDuration=0, totalQuantity = 0, tax = 0, totalAmount = 0;

      // let queryData = `select  count(*),  sum(duration::numeric) AS duration,  sum(case when (left(sonus_callingnumber, 3) ='070' OR 
      // left(sonus_callingnumber, 3) ='080' OR left(sonus_callingnumber, 3) ='090' OR left(sonus_callingnumber, 3) ='550' OR 
      // left(sonus_callingnumber, 3) ='660' OR left(sonus_callingnumber, 3) ='770' OR left(sonus_callingnumber, 3) ='880' ) 
      // then CEIL(duration::numeric) else 0 end) as total_mobile_duration, sum(case when (left(sonus_callingnumber, 3) !='070' 
      // and left(sonus_callingnumber, 3) !='080' and left(sonus_callingnumber, 3) !='090' and left(sonus_callingnumber, 3) !='550' 
      // and left(sonus_callingnumber, 3) !='660' and left(sonus_callingnumber, 3) !='770' and left(sonus_callingnumber, 3) !='880' ) 
      // then CEIL(duration::numeric) else 0 end) as total_landline_duration, orig_carrier_id from cdr_${year}${month} where 
      //   ${where} group by orig_carrier_id `;


        let queryData = `select  count(*),  sum(duration::numeric) AS duration,  sum(case when (lpad((left(sonus_anani, 2))::text,3,'0') ='070' 
        OR lpad((left(sonus_anani, 2))::text,3,'0') ='080' OR lpad((left(sonus_anani, 2))::text,3,'0') ='090' OR 
        lpad((left(sonus_anani, 2))::text,3,'0') ='550' OR lpad((left(sonus_anani, 2))::text,3,'0') ='660' OR 
        lpad((left(sonus_anani, 2))::text,3,'0') ='770' OR lpad((left(sonus_anani, 2))::text,3,'0') ='880' ) then 
        CEIL(duration::numeric) else 0 end) as total_mobile_duration, sum(case when (lpad((left(sonus_anani, 2))::text,3,'0') !='070' 
        and lpad((left(sonus_anani, 2))::text,3,'0') !='080' and lpad((left(sonus_anani, 2))::text,3,'0') !='090' and 
        lpad((left(sonus_anani, 2))::text,3,'0') !='550' and lpad((left(sonus_anani, 2))::text,3,'0') !='660' 
        and lpad((left(sonus_anani, 2))::text,3,'0') !='770' and lpad((left(sonus_anani, 2))::text,3,'0') !='880' ) 
        then CEIL(duration::numeric) else 0 end) as total_landline_duration, orig_carrier_id from cdr_${year}${month}
        where ${where}  group by orig_carrier_id`


      console.log("query ..." + queryData);

      //const queryDataRes = await db.query(queryData, []);

      for (let i = 0; i < queryDataRes.rows.length; i++) {

        let mobileAmount =0 ,landLineAmount =0, mobileDuration= 0, landlineDuration=0, quantity;

        quantity = queryDataRes.rows[i]['count'];
        mobileDuration = queryDataRes.rows[i]['total_mobile_duration'];
        landlineDuration = queryDataRes.rows[i]['total_landline_duration'];
        origCarrierId = queryDataRes.rows[i]['orig_carrier_id'];

        console.log("dmsRateRes length.."+dmsRateRes.length)

        const ratesDetails = dmsRateRes.rows.filter((obj)=>{
          return parseInt(obj.carrier_code) == parseInt(origCarrierId) ? true : false;
        })

        if(ratesDetails.length<=0){
          throw new Error("Rate is not defined!");
        }

        if(parseFloat(mobileDuration)){
          mobileAmount = ratesDetails[0]['mobile_rate'] * parseFloat(mobileDuration)/60;
        }
        if(parseFloat(landlineDuration)){
          landLineAmount = ratesDetails[0]['landline_rate'] * parseFloat(landlineDuration)/60;
        }

        totalLandLineAmount += parseFloat(landLineAmount) ;
        totalMobileAmount += parseFloat(mobileAmount) ;

        totalLandlineDuration += parseFloat(landlineDuration) ;
        totalMobileDuration += parseFloat(mobileDuration );
        totalQuantity += parseInt(quantity);
        

        const insertQuery = `insert into dms_billing_detail(bill_no, customer_code, carrier_code, date_bill, bill_term_start, bill_term_end, 
          mobile_sec, mobile_rate, mobile_amount,  landline_sec, landline_rate, landline_amount, name_insert, date_insert, call_count) VALUES ('${billNo}','${comp_code}',
          '${origCarrierId}',now(),'${year}-${month}-01', '${year}-${month}-${getNumberOfDaysInMonth}', '${mobileDuration}' ,'${ratesDetails[0]['mobile_rate']}' , 
          '${mobileAmount}','${landlineDuration}' ,'${ratesDetails[0]['landline_rate']}','${landLineAmount}' , '${createdBy}',now(),'${quantity}')`;


          console.log("insert details query..."+insertQuery)

        const insertRes = await db.queryIBS(insertQuery, []);
        res.push(insertRes);

      }

        tax = ((totalLandLineAmount) + (totalMobileAmount)) * .1;
        
        tax = parseInt(tax, 10);
        const subTotal =  parseInt(totalLandLineAmount, 10) + parseInt(totalMobileAmount, 10)  ;
        totalAmount = parseInt(totalLandLineAmount, 10) + parseInt(totalMobileAmount, 10) + parseInt(tax, 10);

      const insertSummaryData = `insert into dms_billing_history (customer_code, bill_no, date_payment, bill_term_start,bill_term_end,mobile_sec ,
        mobile_amount, landline_sec, landline_amount, bill_amount,  tax , total_amount, date_insert, name_insert,  call_count) 
        VALUES ('${comp_code}','${billNo}','${payment_plan_date}', '${year}-${month}-01','${year}-${month}-${getNumberOfDaysInMonth}', 
        '${totalMobileDuration}','${totalMobileAmount}', '${totalLandlineDuration}','${totalLandLineAmount}', '${subTotal}' , 
        '${tax}','${totalAmount}',now(),'${createdBy}', ${totalQuantity})`;

          console.log("insert sumarry query..."+insertSummaryData)

      const sumRes = await db.queryIBS(insertSummaryData, []);


    } catch (error) {
      console.log("error in creating dms invoice data !" + error.message)
      throw new Error(error.message)
    }

  },


  getDMSCompanyList: async function (data) {

    try {
      const query = `select * from addi_service_history order by date_bill desc `;

      //  console.log("query.."+query)

      const summaryRes = await db.queryIBS(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting additional services info !" + error.message)
      throw new Error(error.message)
    }
  },

  getInvoiceInfo: async function (data) {

    try {
      const query = `select * from addi_service_history order by date_bill desc `;

      //  console.log("query.."+query)

      const summaryRes = await db.queryIBS(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting additional services info !" + error.message)
      throw new Error(error.message)
    }
  },

  
  updateDMSRate: async function (data) {
    console.log("data..." + JSON.stringify(data))

    try {

      if(data.company_code == null || data.company_code =='' || data.company_code == undefined || data.carrier_code == null || data.carrier_code =='' || data.carrier_code == undefined){
        throw new Error('Invalid Request!');
      }



      const query = `update rate_dms set landline_rate= '${data.landline_rate}' , mobile_rate= '${data.mobile_rate}',  
      updated_by = '${data.edit_by}' , update_date=now() , deleted= ${data.deleted}
      where company_code='${data.company_code}' and carrier_code = '${data.carrier_code}'  `;

      //  console.log("query.."+query)

      const rateUpdateRes = await db.queryIBS(query, []);

      const insertQuery = `insert into rate_dms_history (company_code, carrier_code, carrier_name, date_start, date_expired, landline_rate, mobile_rate
        ,added_by, date_added, updated_by, update_date) VALUES ('${data.company_code}', '${data.carrier_code}', '${data.carrier_name}', 
        '${data.date_start}', '${data.date_expired}', '${data.landline_rate}', '${data.mobile_rate}'  ,'${data.added_by}', '${data.date_added}',
         '${data.edit_by}', now() )  `

      const insertHistoty = await db.queryIBS(insertQuery, []);

      return rateUpdateRes;

    } catch (error) {
      console.log("error in getting dms rates !" + error.message)
      throw new Error(error.message)
    }
  },

  getDMSRateDetails: async function (data) {

    try {
      const query = `select * from rate_dms where deleted = false order by company_code, carrier_code desc `;

      //  console.log("query.."+query)

      const summaryRes = await db.queryIBS(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting dms rates !" + error.message)
      throw new Error(error.message)
    }
  },

  

  deleteDMSDetailsData: async function (data) {

    console.log("data..." + JSON.stringify(data))


    try {

      const query = `delete from dms_billing_history where bill_no ='${data.bill_no}' `;
      const query1 = `delete from dms_billing_detail where bill_no ='${data.bill_no}' `;

      //  console.log("query.."+query)

      const deleteRes = await db.queryIBS(query, []);
      const deleteRes1 = await db.queryIBS(query1, []);


      if (deleteRes) {
        return (deleteRes);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in delete dms data !" + error.message)
      throw new Error(error.message)
    }
  },

  getDMSSummaryData: async function ({ year, month, comp_code }) {

    try {

      if (year == undefined || year == '' || year == null || month == undefined || month == '' || month == null) {
        throw new Error('Invalid Request!')
      }
      let where = `WHERE bill_term_start::date ='${year}-${month}-1' `;
      if (comp_code != undefined && comp_code != '' && comp_code != null) {
        where += `AND customer_code='${comp_code}'`;
      }
      const query = ` select * from dms_billing_history ${where} order by customer_code `;
      const summaryRes = await db.queryIBS(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting additional data summary !" + error.message)
      throw new Error(error.message)
    }
  },

  getDMSDetailsData: async function ({ year, month, comp_code }) {

    try {

      if (year == undefined || year == '' || year == null || month == undefined || month == '' || month == null) {
        throw new Error('Invalid Request!')
      }

      let where = `WHERE bill_term_start::date ='${year}-${month}-1' `;

      if (comp_code != undefined && comp_code != '' && comp_code != null) {
        where += `AND customer_code='${comp_code}'`;
      }

      const query = `select * from dms_billing_detail ${where}  order by customer_code asc`;

      console.log("query.." + query)

      const summaryRes = await db.queryIBS(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting additonal service data details !" + error.message)
      throw new Error(error.message)
    }
  },

  addAddiServiceInfo: async function (data) {

    try {


      console.log("data here.." + JSON.stringify(data))

      if (data.comp_code == undefined || data.comp_code == '') {
        throw new Error('Invalid request');
      }

      const searchQuery = `select * from addi_service_customer_details where 
      customer_code = '${data.comp_code}' and deleted = false`;
      console.log("searchQuery.." + (searchQuery))

      const searchRes = await db.queryIBS(searchQuery);
      if (searchRes && searchRes.rows && searchRes.rows.length > 0) {
        throw new Error("This record is already there, so you can update !!")
      }

      let rate_count = 0, rate_second = 0, orig_carrier_id = 0, term_carrier_id = 0;

      if (data.rate_count !== null && data.rate_count !== undefined) {
        rate_count = data.rate_count;
      }

      if (data.rate_second !== null && data.rate_second !== undefined) {
        rate_second = data.rate_second;
      }

      if (data.term_carrier_id !== null && data.term_carrier_id !== undefined) {
        term_carrier_id = data.term_carrier_id;
      }

      if (data.orig_carrier_id !== null && data.orig_carrier_id !== undefined) {
        orig_carrier_id = data.orig_carrier_id;
      }

      const insertQuery = `insert into addi_service_customer_details (customer_code, orig_carrier_id, term_carrier_id, rate_count, 
        rate_second, added_by, date_added) Values 
                ('${data.comp_code}','${orig_carrier_id}','${term_carrier_id}','${rate_count}', '${rate_second}', 
                '${data.addedBy}', now())`;

      const insertRes = await db.queryIBS(insertQuery, []);

      if (insertRes && insertRes.rowCount) {
        return insertRes.rowCount;
      } else {
        throw new Error("There is issue while inserting record..." + insertRes)
      }

    } catch (error) {
      console.log("error in getting adding additional service info..." + error.message)
      throw new Error(error.message)
    }
  },


  getAddiServiceDetails: async function (data) {

    try {
      const query = `select * from addi_service_customer_details where deleted=false order by customer_code desc `;

      //  console.log("query.."+query)

      const summaryRes = await db.queryIBS(query, []);

      if (summaryRes.rows) {
        return (summaryRes.rows);
      }
      throw new Error('not found')

    } catch (error) {
      console.log("error in getting additional services info !" + error.message)
      throw new Error(error.message)
    }
  },


}


