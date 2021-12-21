const { queryIBS } = require('../../config/database');
var db = require('../../config/database');
var utility = require('../../public/javascripts/utility');

module.exports = {
    getInvoiceData: async function () {
        try {
            return { 'message': 'success', 'path': '\\ws35\国内通信\通信事業部\NewBillingSystem\Leafnet' };

        } catch (error) {
            return error;
        }
    },
    getAllKickbackCustomer: async function () {
        try {
            const query = `select customer_id, service_type, cell_phone_limit,cdr_comp_name, (select 
                customer_name from m_customer where customer_cd = kickback_billable.customer_id limit 1
                ) as customer_name from kickback_billable`;

            const getAllKickbackCustRes = await db.queryIBS(query, [], true);
            if (getAllKickbackCustRes.rows) {
                return getAllKickbackCustRes.rows;
            }
            
        } catch (error) {
            console.log("Err " + error.message);
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
            
        } catch (error) {
            return error;
        }
    },
    createCDR: async function (customer_name, customer_id, year, month) {
        let resChunkArr = [];
        console.log("customer name=" + customer_name, customer_id);

        console.log("year==" + year, month);
        let kickbackCDRHeader = [
            {id:'start_time',title: 'STARTTIME'},{ id:'stop_time',title: 'STOPTIME'},{ id:'orig_ani',title:'ORIGANI'},
            {id:'term_ani',title: 'TERMANI'},{id:'carrier_code',title:'CARRIERCODE'},{id:'call_status',title:'CALLSTATUS'},
            {id:'duration',title:'DURATION'},{id:'total',title: 'TOTAL'}];
        try {
            let noOfDays = utility.daysInMonth(month, year);
            console.log("no of days =" + noOfDays);

            for (let i = 1; i <= noOfDays; i++) {
                
                let fileName = __dirname + `\\CDR\\${customer_name}KICKBACKCDR_${year}${month}${i}.csv`;

                let query = `select start_time, stop_time, orig_ani, term_ani, call_status , carrier_code, duration , Round((duration*minute_rate/60),8) as total 
            from (select start_time, stop_time, duration, orig_ani, term_ani, call_status, carrier_code, kick_company 
            from billcdr_main where start_time::date='${year}-${month}-${i}' and kick_company ='${customer_id}' and duration > 0 and call_status in (16,31)) as b join (select minute_rate,
            customer_id from  kickback_rate ) as c on (b.kick_company=c.customer_id) order by b.start_time asc  `;

                console.log("cdr query=" + query);
                console.log("file name=="+fileName);

                resDataArr = await db.queryIBS(query,[]);
                let rows ;
                if(resDataArr.rows){
                    rows = resDataArr.rows;
                }
                
                //console.log(JSON.stringify(rows));

                

                utility.createCSVWithWriter(fileName, kickbackCDRHeader, rows);
                
            }


        } catch (err) {
            console.log("Error in creating CDR ==" + err.message);
        }
        console.log("done")
    },

}


