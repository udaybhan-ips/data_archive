var db = require('./../../../config/database');
var utility = require('../../../public/javascripts/utility')

module.exports = {
    getSummaryByMonth: async function ({ year, month }) {

        try {
            let lastMonthDate = utility.getPreviousYearMonth(`${year}-${month}`);
            const lastYear = lastMonthDate.year;
            const lastMonth = lastMonthDate.month;

            const currentData = `select dataid, cdrmonth, customercode, fixed_cost_subtotal, cdr_cost_subtotal, tax, total,
             carrier from  byokakin_billing_history where cdrmonth::date = '${year}-${month}-01' ` ;

            const lastMonthData = `select dataid as prev_dataid, cdrmonth as prev_cdrmonth, customercode, 
            fixed_cost_subtotal as prev_fixed_cost_subtotal,  cdr_cost_subtotal as prev_cdr_cost_subtotal, tax as prev_tax,
            total as prev_total, carrier as prev_carrier from  byokakin_billing_history
             where cdrmonth::date = '${lastYear}-${lastMonth}-01'`

            // const query = `select * from (select dataid, cdrmonth, customercode, fixed_cost_subtotal, cdr_cost_subtotal, tax, total, carrier
            // from  byokakin_billing_history where cdrmonth::date = '${year}-${month}-01' ) 
            // as current_month left join (select customercode as customercode_prev, carrier as carrier_prev , cdrmonth as cdrmonth_prev 
            // ,fixed_cost_subtotal as fixed_cost_subtotal_prev, cdr_cost_subtotal as cdr_cost_subtotal_prev,   
            // total as total_prev from  byokakin_billing_history
            // where cdrmonth::date = '${lastYear}-${lastMonth}-01' ) as prev_month 
            // on (current_month.customercode=prev_month.customercode_prev and current_month.carrier=prev_month.carrier_prev) order by customercode`;


            const currentDataRes = await db.queryByokakin(currentData, []);
            const lastMonthDataRes = await db.queryByokakin(lastMonthData, []);

            const tmpObj = {}
            tmpObj['currentData'] = currentDataRes.rows;
            tmpObj['lastMonthData'] = lastMonthDataRes.rows;

            const res = []
            res.push(tmpObj)


            if (currentDataRes.rows) {
                return (res);
            }
            throw new Error('not found')

        } catch (error) {
            console.log("error in getting summary data")
            throw new Error(error.message)
        }
    },



}


