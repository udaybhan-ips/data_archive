const db = require('../../config/database');

module.exports = {
    getTableName: async function(batchId){
        try{    
            const query = `select * from batch_date_control where date_id = '${batchId}' `;
            const tableRes = await db.query(query, []); 

            if(tableRes && tableRes.rows){
                return tableRes.rows;
            }else{
                throw new Error(tableRes);
            }

        }catch(error){
            console.log("Error in geting table name.."+error);
            throw new Error(error);
        }
    },
    createTable: async function(tableName, dbName ){
        try{
            let query = ``, res = '';
            if(dbName == 'ibs'){
                
                res = await db.queryIBS(query, []); 
            }else if(dbName == 'sonus_db'){

                query = `CREATE TABLE IF NOT EXISTS "${tableName}" ("cdr_id" BIGSERIAL, "date_bill" TIMESTAMP WITHout TIME ZONE not null , orig_ani VARCHAR , term_ani VARCHAR,
                "start_time" TIMESTAMP WITHout TIME ZONE not null , "stop_time" TIMESTAMP WITHout TIME ZONE not null
                 ,"duration" VARCHAR(255), "duration_use" VARCHAR(255),
                 "dom_int_call" VARCHAR(255), "orig_carrier_id" VARCHAR(255),
                "selected_carrier_id" VARCHAR, "billing_company_code" VARCHAR, "trunk_port" VARCHAR, "sonus_session_id" VARCHAR,
                "sonus_start_time" TIMESTAMP WITHOUT TIME ZONE, "sonus_disconnect_time" TIMESTAMP WITHout TIME ZONE, "sonus_call_duration" VARCHAR,
                "sonus_call_duration_second" VARCHAR, "sonus_anani" VARCHAR, "sonus_incallednumber" VARCHAR, "sonus_ingressprotocolvariant" VARCHAR,
                "registerdate" TIMESTAMP WITHOUT TIME ZONE, "sonus_ingrpstntrunkname" VARCHAR, "sonus_gw" VARCHAR, "sonus_callstatus" VARCHAR,
                "sonus_callingnumber" VARCHAR, "sonus_egcallednumber" VARCHAR, "sonus_egrprotovariant" VARCHAR, "createdAt" TIMESTAMP WITHOUT TIME ZONE ,
                "updatedAt" TIMESTAMP WITHOUT TIME ZONE , in_outbound integer, term_carrier_id varchar, transit_carrier_id varchar, PRIMARY KEY ("cdr_id"))`;

                res = await db.query(query, []); 
            }
            
            if(res && res.rows){
                return res;
            }else{
                throw new Error(tableRes);
            }

        }catch(error){
            console.log("Error in creating table .."+error);
            throw new Error(error);
        }
    }   
}