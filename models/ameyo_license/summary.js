var db = require("./../../config/database");
var utility = require("../../public/javascripts/utility");

module.exports = {
  getSummaryByMonth: async function ({ year, month }) {
    try {
      let lastMonthDate = utility.getPreviousYearMonth(`${year}-${month}`);
      const lastYear = lastMonthDate.year;
      const lastMonth = lastMonthDate.month;
      const query = `select * from (select  id||customer_id as ids, customer_name, customer_id, billing_month, billing_year, billing_date,
                 duration, landline_amt, mobile_amt, 
                total_amt, invoice_no, mobile_duration, landline_duration, mobile_count, landline_count, total_count from cdr_sonus_outbound_summary 
                where billing_date::date ='${year}-${month}-01'  and customer_id !='00000594') as lj left join  
                (select customer_name as prev_customer_name, customer_id as prev_customer_id, 
                billing_month as prev_billing_month, billing_year as prev_billing_year, billing_date as prev_billing_date, duration as prev_duration, 
                landline_amt as prev_landline_amt, mobile_amt as prev_mobile_amt, total_amt as prev_total_amt, invoice_no as prev_invoice_no, 
                mobile_duration as prev_mobile_duration, landline_duration as prev_landline_duration, mobile_count as prev_mobile_count, 
                landline_count as prev_landline_count, total_count as prev_total_count from cdr_sonus_outbound_summary 
                where  billing_date::date ='${lastYear}-${lastMonth}-01'  ) as rj 
                on (lj.customer_name=rj.prev_customer_name and lj.customer_id = rj.prev_customer_id) order by lj.customer_id `;

      const summaryRes = await db.query(query, []);

      const getInvoiceDetailsFlag = `select * from sonus_outbound_rates where deleted = false`;
      let getInvoiceDetailsFlagResData;
      const getInvoiceDetailsFlagRes = await db.query(
        getInvoiceDetailsFlag,
        [],
        true
      );

      if (
        getInvoiceDetailsFlagRes.rows &&
        getInvoiceDetailsFlagRes.rows.length > 0
      ) {
        getInvoiceDetailsFlagResData = getInvoiceDetailsFlagRes.rows;
      }

      if (summaryRes.rows) {
        let res = [];

        res = summaryRes.rows.map((obj) => {
          let ind = -1;

          ind = getInvoiceDetailsFlagResData.findIndex(
            (ele) => ele.customer_id == obj.customer_id
          );
          if (ind !== -1)
            return {
              ...obj,
              details_invoice:
                getInvoiceDetailsFlagResData[ind].details_invoice,
            };
          else return { ...obj, details_invoice: false };
        });

        return res;
      }
      throw new Error("not found");
    } catch (error) {
      console.log("error in getting summary data");
      throw new Error(error.message);
    }
  },

  getDetailsDataByMonth: async function ({ year, month }) {
    try {
      const query = `select * from cdr_sonus_outbound_details where billing_year ='${year}' and billing_month='${month}'  `;

      const detailsData = await db.query(query, []);

      if (detailsData.rows) {
        return detailsData.rows;
      }
      throw new Error("not found");
    } catch (error) {
      console.log("error in getting details data");
      throw new Error(error.message);
    }
  },

  getAmeyoProcessedData: async function ({ year, month }) {
    try {
      //            console.log("data is "+JSON.stringify(data))

      const query = `select * from ameyo_monthly_bill_details where to_char(bill_start__c, 'YYYY-MM') ='${year}-${month}' `;
      const ratesRes = await db.query(query, [], true);

      if (ratesRes.rows) {
        return ratesRes.rows;
      }
      return { err: "not found" };
    } catch (error) {
      return error;
    }
  },

  getALLAmeyoData: async function () {
    try {
      const query = `select *, quantity*sales_unit_price as amount from ameyo_data order by customer_code asc `;
      const ratesRes = await db.query(query, [], true);

      if (ratesRes.rows) {
        return ratesRes.rows;
      }
      return { err: "not found" };
    } catch (error) {
      return error;
    }
  },

  getALLAmeyoProductData: async function () {
    try {
      const query = `select * from ameyo_license_product_items where deleted = false`;
      const ratesRes = await db.query(query, [], true);

      if (ratesRes.rows) {
        return ratesRes.rows;
      }
      return { err: "not found" };
    } catch (error) {
      return error;
    }
  },

  updateAmeyoProductItemData: async function (data) {
    console.log("data..." + JSON.stringify(data));

    try {
      let productCode = "",
        productItem = "",
        deleted = false;

      if (
        data &&
        data.product_code !== undefined &&
        data.product_code !== null &&
        data.product_code !== ""
      ) {
        productCode = data.product_code;
      }

      if (
        data &&
        data.product_item !== undefined &&
        data.product_item !== null &&
        data.product_item !== ""
      ) {
        productItem = data.product_item;
      }

      if (
        data &&
        data.deleted !== undefined &&
        data.deleted !== null &&
        data.deleted !== ""
      ) {
        deleted = data.deleted;
      }

      if (productCode == "" && productItem === "") {
        throw new Error("Request is invalid!");
      }

      if (deleted) {
        const deleteRecord = `update ameyo_license_product_items set deleted = true where id ='${data.id}'`;
        const deleteRecordRes = await db.query(deleteRecord, [], true);
        if (deleteRecordRes) {
          return "Record deleted!";
        } else {
          throw new Error("error in deleting record");
        }
      }

      const insertHistoryQuery = `insert into ameyo_license_product_items_history(product_code, product_item, date_added, added_by, modified_by, date_modified)
        values('${productCode}','${productItem}', '${data.date_added}', '${data.added_by}', '${data.updated_by}', '${data.date_modified}') `;
      const insertHistoryQueryRes = await db.query(
        insertHistoryQuery,
        [],
        true
      );

      const updateRecord = `update ameyo_license_product_items set product_code='${productCode}', 
      product_item='${productItem}' , modified_by='${data.updated_by}' ,date_modified = now()  where id ='${data.id}'`;
      const updateRecordRes = await db.query(updateRecord, [], true);

      if (updateRecordRes) {
        return "Record updated!!";
      } else {
        throw new Error("Error in updating record!");
      }
    } catch (error) {
      throw new Error("Error!!" + error.message);
    }
  },

  addAmeyoProductItemData: async function (data) {
    console.log("data..." + JSON.stringify(data));

    try {
      let productCode = "",
        productItem = "";

      if (
        data &&
        data.product_code !== undefined &&
        data.product_code !== null &&
        data.product_code !== "" &&
        data.items !== undefined &&
        data.items !== null &&
        data.items !== ""
      ) {
        productCode = data.product_code;
        productItem = data.items;
      } else {
        throw new Error("Request is invalid!");
      }

      const query = `select * from ameyo_license_product_items where product_code='${productCode}' and product_item='${productItem}' and deleted = false`;
      const getProductRes = await db.query(query, [], true);

      if (
        getProductRes &&
        getProductRes.rows &&
        getProductRes.rows.length > 0
      ) {
        return "Record already there!!";
      } else {
        const insertQuery = `insert into ameyo_license_product_items(product_code, product_item, date_added, added_by)
        values('${productCode}','${productItem}', now(), '${data.added_by}') `;
        const insertQueryRes = await db.query(insertQuery, [], true);
        if (insertQueryRes) {
          return "Record added!!";
        }
      }
    } catch (error) {
      throw new Error("Error!!" + error.message);
    }
  },

  getSummary: async function () {
    try {
      const query = `select *, 
          (select status  from sonus_outbound_approval_history where customer_code!='00000594' and 
          invoice_number=cdr_sonus_outbound_summary.invoice_no order by approved_date desc limit 1) as status,
           (select approved_date  from sonus_outbound_approval_history where customer_code!='00000594' and 
           invoice_number=cdr_sonus_outbound_summary.invoice_no order by approved_date desc limit 1) as approved_date,
            (select approved_by  from sonus_outbound_approval_history where customer_code!='00000594' and 
            invoice_number=cdr_sonus_outbound_summary.invoice_no order by approved_date desc limit 1) as approved_by  
            from cdr_sonus_outbound_summary where customer_id!='00000594' order by billing_year desc, billing_month desc`;
      const ratesRes = await db.query(query, []);

      if (ratesRes.rows) {
        return ratesRes.rows;
      }
      return { err: "not found" };
    } catch (error) {
      return error;
    }
  },
};
