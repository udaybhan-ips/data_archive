var utility = require('./../../public/javascripts/utility');
var db = require('./../../config/database');
const ipsPortal = true;

module.exports = {

    getTargetDate: async function (date_id) {
        try {
            const query = `SELECT max(date_set)::date + interval '0 HOURS' as target_date, max(date_set)::date - interval '9 HOURS'  as target_date_with_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
            const targetDateRes = await db.query(query, []);
            if (targetDateRes.rows) {
                return { 'targetDate': (targetDateRes.rows[0].target_date), 'targetDateWithTimezone': (targetDateRes.rows[0].target_date_with_timezone) };
            }
            return { err: 'not found' };
        } catch (error) {
            console.log("Err " + error.message);
            return error;
        }
    },

    getAllTrunkgroup: async function () {
        try {
            const query = `select lj.*, rj.customer_name from ( select trunkport,  customer_id, incallednumber from sonus_outbound_rates where
                deleted = false   and trunkport!='' ) as lj join 
                (select customer_cd, customer_name from m_customer where service_type->>'sonus_outbound' = 'true' ) as rj  
                on (lj.customer_id=rj.customer_cd) order by case when customer_id= '00001371' then 1 else 2 end, customer_id asc  ;` ;

            const getTrunkportRes = await db.query(query, [], ipsPortal);
            //  console.log(getTrunkportRes);
            if (getTrunkportRes.rows) {
                return getTrunkportRes.rows;
            }
            return { err: 'not found' };
        } catch (error) {
            console.log("Err " + error.message);
            return error;
        }
    },
    getSummaryData: async function (targetMonth) {
        //console.log("target month="+targetMonth);
        const year = new Date(targetMonth).getFullYear();
        let month = new Date(targetMonth).getMonth() + 1;

        if (parseInt(month, 10) < 10) {
            month = '0' + month;
        }

        try {
            const query = `select count(*) as total, sum(duration) as duration, start_time::date as day, billing_comp_code,
            sum( case when ( left(sonus_egcallednumber,2)='70' OR left(sonus_egcallednumber,2) = '80' OR 
            left(sonus_egcallednumber,2)='90' ) then 1 else 0 end) as mobile_count,
            sum( case when ( left(sonus_egcallednumber,2)='70' OR  left(sonus_egcallednumber,2)='80' OR left(sonus_egcallednumber,2)='90' ) 
            then 0 else 1 end) as landline_count,
            sum( case when ( left(sonus_egcallednumber,2)='70' OR  left(sonus_egcallednumber,2)='80' OR left(sonus_egcallednumber,2)='90' ) 
            then duration else 0 end) as mobile_duration,
            sum( case when ( left(sonus_egcallednumber,2)='70' OR  left(sonus_egcallednumber,2)='80' OR left(sonus_egcallednumber,2)='90' ) 
            then 0 else duration end) as landline_duration  from 
            cdr_sonus_outbound where to_char(start_time, 'MM-YYYY') = '${month}-${year}'  group by start_time::date, 
            billing_comp_code order by start_time::date asc `;

            let ratesRes = []
            ratesRes = await db.querySonus(query, []);

            if (ratesRes.rows) {
                return (ratesRes.rows);
            }
            return { err: 'not found' };
        } catch (error) {
            console.log("Err " + error.message);
            return error;
        }
    },

    getSummaryDataMysql: async function (targetDateWithTimezone, getAllTrunkgroup) {

        // let sampleData = [{"total":160849,"total_duration":4049165.1799999997,"day":"2023-06-01T00:00:00.000Z"},{"total":158113,"total_duration":4150569.5799999996,"day":"2023-06-02T00:00:00.000Z"},{"total":77277,"total_duration":1936282.84,"day":"2023-06-03T00:00:00.000Z"},{"total":40916,"total_duration":1078988.1300000001,"day":"2023-06-04T00:00:00.000Z"},{"total":162197,"total_duration":4251249.16,"day":"2023-06-05T00:00:00.000Z"},{"total":172180,"total_duration":4589372.19,"day":"2023-06-06T00:00:00.000Z"},{"total":170691,"total_duration":4547671.63,"day":"2023-06-07T00:00:00.000Z"},{"total":172044,"total_duration":4684473,"day":"2023-06-08T00:00:00.000Z"},{"total":175427,"total_duration":4701321.01,"day":"2023-06-09T00:00:00.000Z"},{"total":106257,"total_duration":2541802.17,"day":"2023-06-10T00:00:00.000Z"},{"total":42320,"total_duration":1085586.02,"day":"2023-06-11T00:00:00.000Z"},{"total":161683,"total_duration":4438658.04,"day":"2023-06-12T00:00:00.000Z"},{"total":174321,"total_duration":4898628.47,"day":"2023-06-13T00:00:00.000Z"},{"total":172475,"total_duration":4631399.369999999,"day":"2023-06-14T00:00:00.000Z"},{"total":173378,"total_duration":4639902.720000001,"day":"2023-06-15T00:00:00.000Z"},{"total":173114,"total_duration":4581528.46,"day":"2023-06-16T00:00:00.000Z"},{"total":77354,"total_duration":2014565.1700000002,"day":"2023-06-17T00:00:00.000Z"},{"total":45296,"total_duration":1067361.01,"day":"2023-06-18T00:00:00.000Z"}]; 

        //return sampleData;


        let { trunkPortsVal, sharedTrunkPortsValue, incallednumbers } = await getTrunkPort(getAllTrunkgroup);
        const day = new Date(targetDateWithTimezone).getDate();
        console.log("day .." + day)
        let resData = [];

        try {

            for (let i = 0; i < day; i++) {

                const startDate = new Date(targetDateWithTimezone);
                startDate.setDate(startDate.getDate() - (day - i));
                const year = startDate.getFullYear();
                const month = startDate.getMonth() + 1;
                const date = startDate.getDate();
                const actualStartDate = year + "-" + month + "-" + date + " 15:00:00";

                //console.log("customer info="+JSON.stringify(customerInfo));
                const query = `select count(*) as total, cast(addtime(starttime,'09:00:00') as Date) as day, sum(CALLDURATION*0.01) AS total_duration,
                sum( case when ( left(egcallednumber,2)='70' OR left(egcallednumber,2) = '80' OR left(egcallednumber,2)='90' ) then 1 else 0 end) as mobile_count,
                sum( case when ( left(egcallednumber,2)='70' OR  left(egcallednumber,2)='80' OR left(egcallednumber,2)='90' ) then 0 else 1 end) as landline_count,
                sum( case when ( left(egcallednumber,2)='70' OR  left(egcallednumber,2)='80' OR left(egcallednumber,2)='90' ) then CALLDURATION*0.01 
                else 0 end) as mobile_duration, sum( case when ( left(egcallednumber,2)='70' OR  left(egcallednumber,2)='80' OR 
                left(egcallednumber,2)='90' ) then 0 else CALLDURATION*0.01 end) as landline_duration  from COLLECTOR_73 
                where INGRPSTNTRUNKNAME in (${trunkPortsVal})  AND RECORDTYPEID = 3 AND 
                starttime>='${actualStartDate}' and  startTime < DATE_ADD("${actualStartDate}", INTERVAL 1 DAY) 
                group by cast(addtime(starttime,'09:00:00') as Date) `;


                const sharedTrunkPortsQuery = `select incallednumber, CALLDURATION*0.01 AS duration, ingrpstntrunkname, egcallednumber  
                from COLLECTOR_73 where INGRPSTNTRUNKNAME in (${sharedTrunkPortsValue})  AND RECORDTYPEID = 3 AND 
                 starttime>='${actualStartDate}' and  startTime < DATE_ADD("${actualStartDate}", INTERVAL 1 DAY) `;

                let sharedTrunkPortsQueryRes = await db.mySQLQuery(sharedTrunkPortsQuery, []);
                let sharedTrunkPortsQueryResObj = {}

                if (sharedTrunkPortsQueryRes.length > 0) {
                    const filterdData = sharedTrunkPortsQueryRes.filter((obj) => {
                        let ind = incallednumbers.findIndex((ele) => {
                            let incallednumber = ele.incallednumber.substring(0, ele.incallednumber.length - 1);
                            let lengthOfIncalledNumber = incallednumber.length;
                            if (incallednumber == obj.incallednumber.substring(0, lengthOfIncalledNumber) && ele.trunkport == obj.ingrpstntrunkname)
                                return true;
                            else
                                return false
                        })
                        return ind !== -1 ? true : false;
                    })
                    let totalDuration = 0, landlineCount = 0, landLineDuration=0, mobileCount=0, mobileDuration=0;

                    filterdData.forEach((ele)=>{
                        totalDuration += ele.duration;
                        if(ele.egcallednumber.substr(0,2) =='70' || ele.egcallednumber.substr(0,2) == '80' || ele.egcallednumber.substr(0,2) == '90' ){
                            mobileCount += 1;
                            mobileDuration += parseFloat(ele.duration);
                        }else{
                            landlineCount += 1;
                            landLineDuration += parseFloat(ele.duration);
                        }
                    })

                    sharedTrunkPortsQueryResObj['total'] = filterdData.length;
                    sharedTrunkPortsQueryResObj['day'] = year + "-" + month + "-" + date;
                    sharedTrunkPortsQueryResObj['total_duration'] = totalDuration;

                    sharedTrunkPortsQueryResObj['mobile_duration'] = mobileDuration;
                    sharedTrunkPortsQueryResObj['landline_duration'] = landLineDuration;
                    sharedTrunkPortsQueryResObj['mobile_count'] = mobileCount;
                    sharedTrunkPortsQueryResObj['landline_count'] = landlineCount;
                }
                let rawData = await db.mySQLQuery(query, []);

                if (rawData.length) {
                    let tmpData = {};
                    tmpData['total'] = parseInt(rawData[0].total, 10) + parseInt(sharedTrunkPortsQueryResObj.total, 10)
                    tmpData['total_duration'] = parseFloat(rawData[0].total_duration) + parseFloat(sharedTrunkPortsQueryResObj.total_duration)

                    tmpData['mobile_count'] = parseInt(rawData[0].mobile_count, 10) + parseInt(sharedTrunkPortsQueryResObj.mobile_count, 10)
                    tmpData['mobile_duration'] = parseFloat(rawData[0].mobile_duration) + parseFloat(sharedTrunkPortsQueryResObj.mobile_duration)

                    tmpData['landline_count'] = parseInt(rawData[0].landline_count, 10) + parseInt(sharedTrunkPortsQueryResObj.landline_count, 10)
                    tmpData['landline_duration'] = parseFloat(rawData[0].landline_duration) + parseFloat(sharedTrunkPortsQueryResObj.landline_duration)

                    tmpData['day'] = rawData[0].day;
                    resData = [...resData, tmpData];
                }
            }

            return (resData);
        } catch (error) {
            console.log("Err " + error.message);
            return error;
        }
    },
    createTable: async function (processData, customerInfo) {

        let html = '';
        html = tableCreate(processData, customerInfo);
        return html;
    },

    createTableSummary: async function (processData, rawData) {
        let html = '';
        html = tableCreateSummary(processData, rawData);
        return html;
    },

    sendEmail: async function (html) {

        let mailOption = {
            from: 'ips_tech@sysmail.ipsism.co.jp',
            to:'telecom@ipspro.co.jp',
            //to: 'uday@ipspro.co.jp',
            cc:'y_ito@ipspro.co.jp,uday@ipspro.co.jp',
            subject: 'SONUS OUTBOUND CDR CHECK',
            html
        }

        utility.sendEmail(mailOption);

    },

}

function tableCreateSummary(processData, rawData) {

    let tableRows = '';

    let locS, locE, table = '', html = '', totalCalls = 0, totalDuration = 0;
    let rawDataLength = rawData.length, rawTotalCalls = 0, rawTotalDuration = 0;
    console.log("raw length is " + rawDataLength)

    try {
        let processDataSummary = []

        processData.forEach(element => {
            let tmpObj = {};
            let ind = processDataSummary.findIndex((ele) => {
                return (utility.getCurrentYearMonthDay(ele.day) == utility.getCurrentYearMonthDay(element.day)) ? true : false;
            })

            if (ind !== -1) {
                processDataSummary[ind]['total'] = parseInt(element.total, 10) + parseInt(processDataSummary[ind].total, 10);
                processDataSummary[ind]['duration'] = parseFloat(element.duration) + parseFloat(processDataSummary[ind].duration);

                processDataSummary[ind]['mobile_count'] = parseInt(element.mobile_count, 10) + parseInt(processDataSummary[ind].mobile_count, 10);
                processDataSummary[ind]['mobile_duration'] = parseFloat(element.mobile_duration) + parseFloat(processDataSummary[ind].mobile_duration);

                processDataSummary[ind]['landline_count'] = parseInt(element.landline_count, 10) + parseInt(processDataSummary[ind].landline_count, 10);
                processDataSummary[ind]['landline_duration'] = parseFloat(element.landline_duration) + parseFloat(processDataSummary[ind].landline_duration);

            } else {
                tmpObj['day'] = utility.getCurrentYearMonthDay(element.day);
                tmpObj['total'] = element.total;
                tmpObj['duration'] = element.duration;

                tmpObj['mobile_count'] = element.mobile_count;
                tmpObj['mobile_duration'] = element.mobile_duration;
                tmpObj['landline_count'] = element.landline_count;
                tmpObj['landline_duration'] = element.landline_duration;
                
                processDataSummary.push(tmpObj);
            }

        });

        let length = processDataSummary.length;

        console.log("pro length is " + length)

        if (rawDataLength != length) {
            console.log("I am here!!" + rawDataLength + "pro len" + length);
            return "";
        }


        locS = utility.getCurrentYearMonthDay((rawData[0]['day']));
        locE = utility.getCurrentYearMonthDay(rawData[rawDataLength - 1]['day']);

        //console.log("processDataSummary..."+processDataSummary.length)

        let rawLandlineCount = 0, rawLandlineDuration=0, rawMobileCount=0, rawMobileDuration=0, proLandlineCount = 0, proLandlineDuration=0, 
        proMobileCount=0, proMobileDuration=0;

        for (let i = 0; i < processDataSummary.length; i++) {

            totalCalls += parseInt(processDataSummary[i]['total'], 10);
            totalDuration += parseFloat(processDataSummary[i]['duration']);

            proLandlineCount += parseInt(processDataSummary[i]['landline_count'], 10)
            proLandlineDuration += parseFloat(processDataSummary[i]['landline_duration'])
            proMobileCount += parseInt(processDataSummary[i]['mobile_count'], 10)
            proMobileDuration += parseFloat(processDataSummary[i]['mobile_duration'])

            rawTotalCalls += parseInt(rawData[i]['total'], 10);
            rawTotalDuration += parseFloat(rawData[i]['total_duration']);
            
            rawLandlineCount += parseInt(rawData[i]['landline_count'], 10)
            rawLandlineDuration += parseFloat(rawData[i]['landline_duration'])
            rawMobileCount += parseInt(rawData[i]['mobile_count'], 10)
            rawMobileDuration += parseFloat(rawData[i]['mobile_duration'])


            // console.log("totalCalls"+totalCalls)
            // console.log("totalDuration"+totalDuration)
            // console.log("rawTotalCalls"+rawTotalCalls)
            // console.log("rawTotalDuration"+rawTotalDuration)

            tableRows += '<tr>';
            tableRows += `<td class="day">${utility.getCurrentYearMonthDay(rawData[i]['day'])}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas(parseInt(rawData[i]['landline_count'], 10))}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas(parseInt(processDataSummary[i]['landline_count'], 10))}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas(parseInt((parseFloat(rawData[i]['landline_duration'])), 10))}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas(parseInt((parseFloat(processDataSummary[i]['landline_duration'])), 10))}</td>`;

            
            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas(parseInt(rawData[i]['mobile_count'], 10))}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas(parseInt(processDataSummary[i]['mobile_count'], 10))}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas(parseInt((parseFloat(rawData[i]['mobile_duration'])), 10))}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas(parseInt((parseFloat(processDataSummary[i]['mobile_duration'])), 10))}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas((parseInt(rawData[i]['landline_count'], 10)) + (parseInt(rawData[i]['mobile_count'], 10)))}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas((parseInt(processDataSummary[i]['landline_count'], 10)) + (parseInt(processDataSummary[i]['mobile_count'], 10)))}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas( ((parseInt(rawData[i]['landline_count'], 10)) + (parseInt(rawData[i]['mobile_count'], 10))) - 
            ((parseInt(processDataSummary[i]['landline_count'], 10)) +(parseInt(processDataSummary[i]['mobile_count'], 10)))  )}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas( parseInt((parseFloat(rawData[i]['mobile_duration'])), 10) + 
            parseInt((parseFloat(rawData[i]['landline_duration'])), 10) )}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas( parseInt((parseFloat(processDataSummary[i]['mobile_duration'])), 10) + 
            parseInt((parseFloat(processDataSummary[i]['landline_duration'])),10) )}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">
            ${utility.numberWithCommas( (parseInt((parseFloat(rawData[i]['mobile_duration'])), 10) + 
            parseInt((parseFloat(rawData[i]['landline_duration'])), 10) ) - ( parseInt((parseFloat(processDataSummary[i]['mobile_duration'])), 10) 
            + parseInt((parseFloat(processDataSummary[i]['landline_duration'])), 10) ) )}</td>`;

            tableRows = tableRows + '</tr>';
        }

        rawTotalDuration = parseInt(rawTotalDuration, 10)
        totalDuration = parseInt(totalDuration, 10)

        tableRows += '<tr>';
        tableRows += `<td class="day">Summary</td>`;

        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(rawLandlineCount)}</td>`;
        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(proLandlineCount)}</td>`;

        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(parseInt(rawLandlineDuration, 10))}</td>`;
        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(parseInt(proLandlineDuration, 10))}</td>`;

        
        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(rawMobileCount)}</td>`;
        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(proMobileCount)}</td>`;

        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(parseInt(rawMobileDuration, 10))}</td>`;
        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(parseInt(proMobileDuration, 10))}</td>`;

        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(rawLandlineCount+rawMobileCount)}</td>`;
        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(proLandlineCount+proMobileCount)}</td>`;

        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas( (rawLandlineCount+rawMobileCount) - (proLandlineCount+proMobileCount)  )}</td>`;

        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas( parseInt(rawMobileDuration, 10) + parseInt(rawLandlineDuration, 10) )}</td>`;
        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas( parseInt(proMobileDuration, 10) + parseInt(proLandlineDuration,10) )}</td>`;

        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas( 
                (parseInt(rawMobileDuration, 10) + parseInt(rawLandlineDuration, 10) ) - 
                ( parseInt(proMobileDuration, 10) + parseInt(proLandlineDuration, 10) ) 
             )}</td>`;

        tableRows = tableRows + '</tr>';


        let h4 = `This is the daily CDR Report of All Sonus Customer !! <br /><br />`;
        let h3 = `${locS} ~ ${locE} !! `;


        html += h4;
        html += h3;
        const style = `thead { text-align: left;background-color: #4CAF50; color: white; }`


        table += `<table class='some-table' border="1" style='${style}'>
             <thead> 
                <tr> 
                    <th>DATE</th> 
                    
                    <th>RAW Land Line Count</th>
                    <th>Pro Land Line Count</th>

                    <th>RAW Land Line Duration</th>
                    <th>Pro Land Line Duration</th>

                    <th>RAW Mobile Count</th>
                    <th>Pro Mobile Count</th>

                    <th>RAW Mobile Duration</th>
                    <th>Pro Mobile Duration</th>
                    
                    <th>RAW Call Count</th> 
                    <th>Pro Call Count</th> 
                    <th>Diff</th> 

                    <th>RAW Duration</th>                     
                    <th>Pro Duration</th> 
                    <th>Diff</th> 
                </tr> 
            </thead>             
        <tbody>
        ${tableRows}    
        </tbody>
        </table>`;




    } catch (err) {
        console.log("Error " + err.message);
        return err;
    }


    let div = `<div style="margin: auto;width: 100%;padding: 5px;">${table}</div>`;

    html += div;
    // html+="Thank you";


    return html;
}



function tableCreate(processData, customerInfo) {

    //console.log("rawData="+JSON.stringify(rawData))
    //console.log("processData="+JSON.stringify(processData))
    // console.log("create table---");
    let tableRows = '';

    let length = processData.length, locS, locE, table = '', html = '', totalCalls = 0, totalDuration = 0; 
    let totalLandlineCalls = 0, totalLandlineDuration = 0, totalMobileCalls = 0, totalMobileDuration = 0 ;

    if (length == 0) {
        return '';
    }
    try {

        locS = utility.getCurrentYearMonthDay((processData[0]['day']));
        locE = utility.getCurrentYearMonthDay(processData[length - 1]['day']);



        //    console.log("locS"+locS)
        //   console.log("locE"+locE)

        for (let i = 0; i < processData.length; i++) {

            totalCalls += parseInt(processData[i]['total'], 10);
            totalDuration += parseInt(processData[i]['duration']);

            totalLandlineCalls += parseInt(processData[i]['landline_count'], 10);
            totalLandlineDuration += parseFloat(processData[i]['landline_duration']);
            totalMobileCalls += parseInt(processData[i]['mobile_count'], 10);
            totalMobileDuration += parseFloat(processData[i]['mobile_duration']);

            tableRows += '<tr>';
            tableRows += `<td class="day">${utility.getCurrentYearMonthDay(processData[i]['day'])}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(processData[i]['landline_count'])}</td>`;
            tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(parseInt(processData[i]['landline_duration'], 10))}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(processData[i]['mobile_count'])}</td>`;
            tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(parseInt(processData[i]['mobile_duration'], 10))}</td>`;

            tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(processData[i]['total'])}</td>`;
            tableRows += `<td style="text-align:right" class="Processed Data">${utility.numberWithCommas(parseInt(processData[i]['landline_duration'], 10) + parseInt(processData[i]['mobile_duration'], 10) )}</td>`;
            tableRows = tableRows + '</tr>';
        }

        tableRows += '<tr>';
        tableRows += `<td class="day">Summary</td>`;

        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(totalLandlineCalls)}</td>`;
        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(parseInt(totalLandlineDuration, 10))}</td>`;

        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(totalMobileCalls)}</td>`;
        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(parseInt(totalMobileDuration, 10))}</td>`;

        tableRows += `<td style="text-align:right" class="Raw Data">${utility.numberWithCommas(totalCalls)}</td>`;
        tableRows += `<td style="text-align:right" class="Processed Data">${utility.numberWithCommas(parseInt(totalLandlineDuration, 10) + parseInt(totalMobileDuration, 10) )}</td>`;
        tableRows = tableRows + '</tr>';


        let h4 = `This is the daily CDR Report of ${customerInfo.customer_name} !! <br /><br />`;
        let h3 = `${locS} ~ ${locE} !! `;
        let h2 = `<h2 align="center"> ${customerInfo.customer_name} CDR BALANCE CHECK </h2>`;;

        html += h4;
        html += h3;
        html += h2;


        const style = `thead { text-align: left;background-color: #4CAF50; color: white; }`


        table += `<table class='some-table' border="2" style='${style}'>
             <thead> 
                <tr> 
                    <th>DATE</th> 
                    <th>Processed Call Landline Count</th> 
                    <th>Processed Landline Duration</th> 
                    <th>Processed Mobile Call Count</th> 
                    <th>Processed Mobile Duration</th> 

                    <th>Processed Call Count</th> 
                    <th>Processed Duration</th> 
                </tr> 
            </thead>             
        <tbody>
        ${tableRows}    
        </tbody>
        </table>`;




    } catch (err) {
        console.log("Error " + err.message);
        return err;
    }


    let div = `<div style="margin: auto;width: 100%; padding: 5px;">${table}</div>`;

    html += div;
    // html+="Thank you";


    return html;
}


async function getTrunkPort(getAllTrunkgroupRes) {

    let trunkPortsVal = '', sharedTrunkPorts = new Set(), incallednumbers = [];


    //console.log("getAllTrunkgroupRes" + JSON.stringify(getAllTrunkgroupRes))
    try {


        for (let i = 0; i < getAllTrunkgroupRes.length; i++) {
            if (getAllTrunkgroupRes[i]['incallednumber']) {
                incallednumbers.push(getAllTrunkgroupRes[i]);
                sharedTrunkPorts.add(getAllTrunkgroupRes[i].trunkport)

            } else {
                let trunkPorts = getAllTrunkgroupRes[i].trunkport;
                let trunkPortsArr = trunkPorts.split(",");

                for (let j = 0; j < trunkPortsArr.length; j++) {
                    trunkPortsVal = trunkPortsVal + `'${trunkPortsArr[j]}',`;
                }
            }

        }

        let sharedTrunkPortsValue = "";
        for (const item of sharedTrunkPorts.values()) {
            sharedTrunkPortsValue += `'${item}',`;
        }

        //remove last value (,)
        if (trunkPortsVal.substr(trunkPortsVal.length - 1) == ',') {
            trunkPortsVal = trunkPortsVal.substring(0, trunkPortsVal.length - 1);
        }

        if (sharedTrunkPortsValue.substr(sharedTrunkPortsValue.length - 1) == ',') {
            sharedTrunkPortsValue = sharedTrunkPortsValue.substring(0, sharedTrunkPortsValue.length - 1);
        }

        return { trunkPortsVal, sharedTrunkPortsValue, incallednumbers }
    } catch (err) {
        console.log("Error in creating where clause!!" + err.message)
    }


}