var db = require('../../config/database');

module.exports = {

    
    getKICKBACKConfigEmailInfo: async function (data) {

        try {
          const query = `select * from kickback_email_config where deleted = false order by customer_id `;
          //  console.log("query.."+query)
          const getKickConfigEmailInfoRes = await db.queryIBS(query, []);
          if (getKickConfigEmailInfoRes.rows) {
            return (getKickConfigEmailInfoRes.rows);
          }
          throw new Error('not found')
        } catch (error) {
          console.log("error in getting kickback email config !" + error.message)
          throw new Error(error.message)
        }
      },
    
      updateKICKBACKConfigEmailInfo: async function (data) {
       
          console.log("data..." + JSON.stringify(data))
          let updateData = "", customerId = "";
          try {
      
            if (data.customer_id !== undefined && data.customer_id !== null && data.customer_id !== '') {
              customerId = data.customer_id;
            } else {
              throw new Error("Invalid request!");
            }
      
      
            if (data.payment_due_date_mode) {
              updateData = `payment_due_date_mode= '${data.payment_due_date_mode}',`;
            }
            if (data.email_content) {
              updateData = updateData + `email_content= '${data.email_content}',`;
            }
            if (data.email_to) {
              updateData = updateData + `email_to= '${data.email_to}',`;
            }
      
      
            if (data.email_subject) {
              updateData = updateData + `email_subject= '${data.email_subject}',`;
            }
      
            if (data.email_cc) {
              updateData = updateData + `email_cc= '${data.email_cc}',`;
            }

            if (data.deleted) {
              updateData = updateData + `deleted= '${data.deleted}',`;
            }
      
            updateData = updateData + `update_by= '${data.edit_by}',`;


            updateData = updateData + `updated_date= now()`;
      
      
      
            const query = `update kickback_email_config  set ${updateData} where customer_id ='${customerId}' `;
      
      
            //  console.log("query.."+query)
      
            const deleteRes = await db.queryIBS(query, []);
      
      
            if (deleteRes) {
              return (deleteRes);
            }
            throw new Error('not found')
      
          } catch (error) {
            console.log("error in update commission config data !" + error.message)
            throw new Error(error.message)
          }
        
      },
    
    
      addKICKBACKConfigEmailInfo: async function (data) {
    
        //console.log("data..." + JSON.stringify(data))
    
        try {
    
          if (data && data.comp_code !== '') {
            const checkQuery = `select * from kickback_email_config where customer_id='${data.comp_code}' and deleted = false  `;
            let res = await db.queryIBS(checkQuery, []);
            if (res && res.rows && res.rows.length > 0) {
              throw new Error('Record already exist!');
            }
    
          } else {
            throw new Error('Invalid data!')
          }
    
    
          const query = `insert into kickback_email_config  (customer_id, payment_due_date_mode, email_content, email_subject , email_to, email_cc, date_added,added_by) 
          values ('${data.comp_code}','${data.payment_plan_type}','${data.email_content}','${data.email_subject}','${data.email_to}','${data.email_cc}',now(),'${data.addedBy}')`;
    
          //  console.log("query.."+query)
    
          const deleteRes = await db.queryIBS(query, []);
    
    
          if (deleteRes) {
            return (deleteRes);
          }
          throw new Error('not found')
    
        } catch (error) {
          console.log("error in delete commission data !" + error.message)
          throw new Error(error.message)
        }
      },

    getKICKCompanyInfo: async function (data) {

        try {
            const query = `select * from kickback_billable where deleted = false order by customer_id`;
            const summaryRes = await db.queryIBS(query, []);

            if (summaryRes.rows) {
                return (summaryRes.rows);
            }
            throw new Error('not found')

        } catch (error) {
            console.log("error in getting kickback configuration!" + error.message)
            throw new Error(error.message)
        }
    },

    updateCompany: async function (param) {

        try {
            console.log("data.." + JSON.stringify(param))
            let cell_phone_limit = 0;
            if (param.cell_phone_limit !== null && param.cell_phone_limit !== undefined && param.cell_phone_limit !== '') {
                cell_phone_limit = param.cell_phone_limit;
            }
            const query = `update kickback_billable set cell_phone_limit='${cell_phone_limit}', 
      modified_by='${param.updatedBy}', modified_date=now() , deleted=${param.deleted} where id = ${param.id} `;

            const summaryRes = await db.queryIBS(query, []);

            if (summaryRes.rows) {
                return (summaryRes.rows);
            }
            throw new Error('not found')

        } catch (error) {
            console.log("error in getting adding updating kotehi info.." + error.message)
            throw new Error(error.message)
        }
    },

    addCompanyInfo: async function (data) {

        try {
            console.log("data here.." + JSON.stringify(data))
            if (data.comp_code == undefined || data.comp_code == '' || data.type_of_service == '' || data.type_of_service == undefined) {
                throw new Error('Invalid request');
            }
            const searchQuery = `select * from kickback_billable where  customer_id= '${data.comp_code}' and deleted = false`;
            const searchRes = await db.queryIBS(searchQuery);
            if (searchRes && searchRes.rows && searchRes.rows.length > 0) {
                throw new Error("This kick company  already there, so you can update!!")
            }
            const insertQuery = `insert into kickback_billable (customer_id, service_type, cell_phone_limit, added_by, added_date) Values 
                ('${data.comp_code}','${data.type_of_service}','${data.cell_phone_limit}','${data.added_by}',now()) returning id`;

            const insertRes = await db.queryIBS(insertQuery, []);

            if (insertRes.rowCount && insertRes) {
                return insertRes.rowCount;
            }
            throw new Error(insertRes)
         

        } catch (error) {
            console.log("error in adding kick company info..." + error.message)
            throw new Error(error.message)
        }
    },


}


