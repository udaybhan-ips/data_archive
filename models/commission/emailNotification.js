var utility = require('./../../public/javascripts/utility');
var db = require('./../../config/database');

module.exports = {

    getTargetDate: async function (date_id) {
        try {
            const query = `SELECT max(date_set)::date + interval '0 HOURS' as target_date, max(date_set)::date - interval '9 HOURS'  
            as target_date_with_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
            const targetDateRes = await db.query(query, []);
            //console.log(targetDateRes);
            if (targetDateRes.rows) {
                return { 'targetDate': (targetDateRes.rows[0].target_date), 'targetDateWithTimezone': (targetDateRes.rows[0].target_date_with_timezone) };
            }
            return { err: 'not found' };
        } catch (error) {
            return error;
        }
    },

    getSummaryData: async function (targetMonth, type_of_service) {
        console.log("target month=" + targetMonth);

        const year = new Date(targetMonth).getFullYear();
        let month = new Date(targetMonth).getMonth() + 1;
        if (parseInt(month, 10) < 10) {
            month = '0' + month;
        }
        try {
            const query = `select count(*) as total, sum(duration_use) as duration, start_time::date as day, type_of_service from cdr_sonus where 
          to_char(start_time, 'MM-YYYY') = '${month}-${year}' and type_of_service='${type_of_service}' 
          group by start_time::date, type_of_service order by start_time::date asc `;
            const ratesRes = await db.query(query, []);

            if (ratesRes.rows) {
                return (ratesRes.rows);
            }
            return { err: 'not found' };
        } catch (error) {
            return error;
        }
    },

    getSummaryDataMysql: async function (targetDateWithTimezone, type_of_service) {

        const day = new Date(targetDateWithTimezone).getDate();
        let resData = [];
        try {
            for (let i = 0; i < day; i++) {

                let startDate = new Date(targetDateWithTimezone);
                startDate.setDate(startDate.getDate() - (day - i));
                let year = startDate.getFullYear();
                let month = startDate.getMonth() + 1;
                let date = startDate.getDate();
                let actualStartDate = year + "-" + month + "-" + date + " 15:00:00";

                // console.log("year=="+year+" \n month=="+month+" \n day="+day);
                // console.log("start Date="+startDate);
                // console.log("actual start date="+actualStartDate)
                let query = "";
                if (type_of_service === 'Leafnet_0067745109') {
                    query = `select count(*) as total, cast(addtime(starttime,'09:00:00') as Date) as day, 
                    'Leafnet_0067745109' as  type_of_service from COLLECTOR_73 
                    where EGCALLEDNUMBER in ( '345650514' ) and CALLSTATUS in (16,31)
                    and INGRPSTNTRUNKNAME in ('GSX4TOGXL3','GSX4TOGXL4','GXL3TOGSX5','GXL4TOGSX5') and RECORDTYPEID=3 
                    AND  starttime>='${actualStartDate}' and startTime < DATE_ADD("${actualStartDate}", INTERVAL 1 DAY) 
                    group by cast(addtime(starttime,'09:00:00') as Date), type_of_service 
                    order by cast(addtime(starttime,'09:00:00') as Date) asc`;

                } else {
                    query = `select count(*) as total, cast(addtime(starttime,'09:00:00') as Date) as day,
                    'Leafnet_006751' as  type_of_service from COLLECTOR_73 
                    where EGRTGNAME in ('IPSSHG5423J7','IPSSHGF59EJ', 'IPSKRG5A00J', 'IPSKRG6BIIJ', 'IPSFUS10NWJ' ) 
                    AND BILLNUM = '5050506751' 
                    AND RECORDTYPEID = 3 
                    AND  starttime>='${actualStartDate}' and startTime < DATE_ADD("${actualStartDate}", INTERVAL 1 DAY) 
                    group by cast(addtime(starttime,'09:00:00') as Date) , type_of_service
                    order by cast(addtime(starttime,'09:00:00') as Date) asc`;
                }


                //console.log(query);
                rawData = await db.mySQLQuery(query, []);
                if (rawData.length) {
                    resData = [...resData, rawData[0]];
                }
            }
            //console.log(JSON.stringify(rawData));
            return (resData);
        } catch (error) {
            return error;
        }
    },
    createTable: async function (rawData, processData, type_of_service) {

        let proDataLen = processData.length;
        let rawDataLen = rawData.length;
        let html = '';
        let tableDiv = '';

        console.log("proData=" + proDataLen);
        console.log("rawData=" + rawDataLen);
        if (rawDataLen > 0 && proDataLen > 0)
            tableDiv = tableCreate(rawData, processData, type_of_service);
        //console.log("html");
        //console.log(html);

        return tableDiv;
    },
    sendEmail: async function (tableDiv) {

        let html = '';
         let h4 = `Hi, <br /> This is the daily Leafnet CDR Report!! <br /><br />`;
        //let h1 = `<br />  ${type_of_service} <br /><br />`;
        //let h3 = `${locSA[0]} ~ ${locEA[0]} !! `;
         let h2 = `<h2 align="center"> LEAFNET CDR BALANCE CHECK </h2>`;
        html += h4;
         //html += h3;
        html += h2;
        html += tableDiv;
        html += "Thank you";

        let mailOption = {
            from: 'ips_tech@sysmail.ipsism.co.jp',
            to: 'uday@ipspro.co.jp',
            cc:'y_ito@ipspro.co.jp',
            subject: 'LEAFNET CDR CHECK',
            html
        }

        utility.sendEmail(mailOption);

    },

}


function tableCreate(rawData, processData, type_of_service) {
    console.log("create table---");
    let tableRows = '';

    let length = rawData.length, locS, locSA, locE, locEA;

    locS = new Date(rawData[0]['day']);
    locSA = locS.toLocaleString().split(",");
    locE = new Date(rawData[length - 1]['day']);
    locEA = locE.toLocaleString().split(",");

    //    console.log("1="+locEA[0]);

    for (let i = 0; i < rawData.length; i++) {
        let diff = rawData[i]['total'] - processData[i]['total'];
        let rawValue = utility.numberWithCommas(rawData[i]['total']);
        let processValue = utility.numberWithCommas(processData[i]['total']);
        tableRows += '<tr>';
        tableRows += `<td class="day">${utility.formatDate(rawData[i]['day'])}</td>`;
        tableRows += `<td style="text-align:right" class="Raw Data">${rawValue}</td>`;
        tableRows += `<td style="text-align:right" class="Processed Data">${processValue}</td>`;
        tableRows += `<td style="text-align:right" class="Difference">${diff}</td>`;
        tableRows = tableRows + '</tr>'
    }
    
    let table = '';
    const style = `thead { text-align: left;background-color: #4CAF50; color: white; }`

    try {
        table += `<table class='some-table' border="2" style='${style}'>
             <thead> <tr> <th>DATE</th> <th>SONUS RAW(10.168.11.252</th> <th>PRO(10.168.11.41)</th> <th> DIFFERENCE </th></tr> </thead>
        <tbody>
        ${tableRows}    
        </tbody>
        </table>`;


    } catch (err) {
        throw Error("Error !" + err);
    }
    let h1 = `<h2> Service Type ${type_of_service} </h2>`

    let div = h1 + `<div style="margin: auto;width: 50%;padding: 10px;">${table}</div>`;
    
    //html += div;
    //html += "Thank you";
    // console.log("sdfsdf"+html);

    return div;
}