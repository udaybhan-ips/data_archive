var db = require('../../config/database');

module.exports = {
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

            return insertRes.rowCount;

        } catch (error) {
            console.log("error in getting adding kick company info..." + error.message)
            throw new Error(error.message)
        }
    },


}


