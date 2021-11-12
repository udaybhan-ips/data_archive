var utility = require('./../../public/javascripts/utility');
var db = require('./../../config/database');

module.exports = {

    getTargetDate: async function (date_id) {
        try {
            const query = `SELECT max(date_set)::date + interval '0 HOURS' as target_date, max(date_set)::date - interval '9 HOURS'  as target_date_with_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
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
    deleteTrafficSummary: async function (kick_company, targetDate, mulitple) {
        try {
            let query = "";
            if(mulitple){
                query = `delete FROM kickback_traffic_summary where traffic_date::date = '${targetDate}'::date 
                and customer_cd ='${kick_company}' and main_id!='0'`;
    
            }else{
                query = `delete FROM kickback_traffic_summary where traffic_date::date = '${targetDate}'::date 
                and customer_cd ='${kick_company}' and main_id='0'`;
    
            }
            const deleteTrafficSummaryRes = await db.queryIBS(query, []);
            return deleteTrafficSummaryRes;
        } catch (error) {
            return error;
        }
    },
    getAllKickComp: async function () {
        try {
            console.log("in get all kick comp");

            const query = ` select distinct(kick_company) as customer_cd from billcdr_main order by kick_company`;
            //const query = ` select * from kickback_cdr_carrier where email_type='multiple' order by customer_cd`;

            const kickCompRes = await db.queryIBS(query, []);

            return kickCompRes.rows;

        } catch (error) {
            console.log("err in getting kick company  =" + error.message);
            return error;
        }
    },
    getAllKickCompEmail: async function () {
        try {
            console.log("in get all kick comp email");

           // const query = ` select * from kickback_cdr_carrier where east_link_flag=1 and mail_address!='' order by customer_cd`;
            const query = ` select * from kickback_cdr_carrier where (east_link_flag=1 and mail_address!='') OR (email_type='multiple') order by customer_cd`;

            const kickCompRes = await db.queryIBS(query, []);

            return kickCompRes.rows;

        } catch (error) {
            console.log("err in getting kick company  =" + error.message);
            return error;
        }
    },
    getAllProTrafficSummary: async function (targetMonth) {
        console.log("in all sum")
        const year = new Date(targetMonth).getFullYear();
        let month = new Date(targetMonth).getMonth() + 1;
        if (parseInt(month, 10) < 10) {
            month = '0' + month;
        }

        try {
            const query = `select count(*) as total,  sum(case when (call_status =16 OR call_status =31) then 1 else 0 end)  as total_16_31,
             start_time::Date as day from billcdr_main where to_char(start_time, 'MM-YYYY') = '${month}-${year}' 
             group by start_time::Date order by start_time::Date `;
            // '2021-09-3
            console.log("query==" + query);

            const getAllTrafficSummaryRes = await db.queryIBS(query, []);
            return getAllTrafficSummaryRes.rows;
        } catch (error) {
            return error;
        }
    },
    getAllKickTrafficComp: async function (targetMonth) {
        try {
         //   console.log("in get all kick  traffic comp");

            const year = new Date(targetMonth).getFullYear();
            let month = new Date(targetMonth).getMonth() + 1;
            if (parseInt(month, 10) < 10) {
                month = '0' + month;
            }

            const query = ` select distinct(CUSTOMER_CD) as customer_cd, (select customer_name from m_customer 
                where customer_cd=kickback_traffic_summary.customer_cd) as customer_name, 
                (select case when cell_phone_limit!=0 then cell_phone_limit/10000 else 0 end as cell_phone_limit 
                    from kickback_billable where customer_id=kickback_traffic_summary.customer_cd)  from kickback_traffic_summary  where
            CUSTOMER_CD NOT IN ('00000350','00000026','00000138','00000141','00000292',
            '00000409','00000564','00000565','88888888') and to_char(traffic_date, 'MM-YYYY') = '${month}-${year}'
             order by customer_cd`;
            //const query = ` select * from kickback_cdr_carrier where email_type='multiple' order by customer_cd`;

            const kickCompRes = await db.queryIBS(query, []);

            return kickCompRes.rows;

        } catch (error) {
            console.log("err in getting kick company  =" + error.message);
            return error;
        }
    },

    getAllProTrafficSummaryInternal: async function (targetMonth, kick_company) {
        console.log("in all sum")
        const year = new Date(targetMonth).getFullYear();
        let month = new Date(targetMonth).getMonth() + 1;
        if (parseInt(month, 10) < 10) {
            month = '0' + month;
        }



        try {
            let query = "";
            if (kick_company) {
                query = ` select sum(kotei_cnt) kotei_cnt , sum(kotei_min)::int kotei_min, sum(keitai_cnt) keitai_cnt,
                sum(keitai_min)::int keitai_min, sum(all_cnt)all_cnt , sum(all_min)::int all_min,
               traffic_date::date as traffic_date, customer_cd  from kickback_traffic_summary where main_id=0 and  
                 to_char(traffic_date, 'MM-YYYY') = '${month}-${year}'  and customer_cd ='${kick_company}'
                group by traffic_date::Date, customer_cd  order by traffic_date::Date `;

            } else {


                query = ` select sum(kotei_cnt) kotei_cnt , sum(kotei_min)::int kotei_min, sum(keitai_cnt) keitai_cnt,
             sum(keitai_min)::int keitai_min, sum(all_cnt)all_cnt , sum(all_min)::int all_min, 
            traffic_date::date as traffic_date  from kickback_traffic_summary where main_id=0 and customer_cd not in
             ('00000026','00000138','00000141','00000292','00000409','00000564','00000565','88888888') and 
              to_char(traffic_date, 'MM-YYYY') = '${month}-${year}' 
             group by traffic_date::Date order by traffic_date::Date `;
            }
            // '2021-09-3
            console.log("query==" + query);

            const getAllTrafficSummaryRes = await db.queryIBS(query, []);
            return getAllTrafficSummaryRes.rows;
        } catch (error) {
            console.log("error"+error.message)
            return error;
        }
    },

    getTrafficSummary: async function (kickCompany, targetDate) {
        try {
            const query = `select count(*) as total_calls, sum(duration/60) as total_duration, term_use, kick_company
            from billcdr_main where start_time::date = '${targetDate}'::date and kick_company='${kickCompany}' and duration>1 group by term_use,kick_company `;
            const getTrafficSummaryRes = await db.queryIBS(query, []);
            return getTrafficSummaryRes.rows;
        } catch (error) {
            return error;
        }
    },
    getTrafficSummaryMultiple: async function (kickCompany, targetDate) {
        try {
            const query = `select count(*) as total_calls, sum(duration/60) as total_duration, term_use, kick_company, daily_batch from
             (select duration, term_use, kick_company, term_ani from billcdr_main where start_time::date = '${targetDate}'::date and
              kick_company='${kickCompany}')as lj join (select substring(_03_numbers, 2, 10) as _03_numbers, customer_cd, daily_batch  
              from  _03numbers where customer_cd ='${kickCompany}') as rj on(lj.term_ani=rj._03_numbers)  group by  term_use, kick_company, daily_batch `;
            const getTrafficSummaryRes = await db.queryIBS(query, []);
            return getTrafficSummaryRes.rows;
        } catch (error) {
            return error;
        }
    },
    getTrafficSummaryByTermUse: async function (kickCompany, targetDate) {
        try {
            const query = `select count(*) as total_calls, sum(duration/60) as total_duration, term_use, kick_company
            from billcdr_main where start_time::date = '${targetDate}'::date and kick_company='${kickCompany}' and duration>1 group by term_use,kick_company `;
            const getTrafficSummaryRes = await db.queryIBS(query, []);
            return getTrafficSummaryRes.rows;
        } catch (error) {
            return error;
        }
    },
    getEmailDetails: async function (targetDate, kickCompany) {
        try {
            const query = `select * from kickback_cdr_carrier_multiple where customer_cd='${kickCompany}' `;
            const emailDetailsRes = await db.queryIBS(query, []);
            return emailDetailsRes.rows;
        } catch (error) {
            return error;
        }
    },
    insertTrafficSummary: async function (data, kick_company, targetDate) {
        console.log("insert traffic summary ");
        try {

            let total_count = 0;
            let total_duration = 0;
            let mob_count = 0;
            let mob_duration = 0;
            let land_count = 0;
            let land_duration = 0;


            for (let i = 0; i < data.length; i++) {
                if (data[i]['term_use'] == 2) {
                    mob_count = data[i]['total_calls'];
                    mob_duration = data[i]['total_duration'];
                }
                if (data[i]['term_use'] == 1) {
                    land_count = data[i]['total_calls'];
                    land_duration = data[i]['total_duration'];
                }
                total_count = total_count + parseInt(data[i]['total_calls'], 10);
                total_duration = total_duration + parseFloat(data[i]['total_duration']);

            }
            let query = `insert into kickback_traffic_summary (customer_cd ,main_id, traffic_date,kotei_cnt, kotei_min
            ,keitai_cnt,keitai_min,all_cnt,all_min) VALUES('${kick_company}', '0', '${targetDate}', 
            '${land_count}','${land_duration}','${mob_count}','${mob_duration}','${total_count}','${total_duration}')`;

            //console.log("query==" + query);

            let insertTrafficSummaryRes = await db.queryIBS(query, []);

        } catch (error) {
            console.log("Error in result ---" + error.message);
            return error;
        }
    },

    insertTrafficSummaryMultiple: async function (data, kick_company, targetDate) {
        console.log("insert traffic summary ");
        try {

            let total_count = 0;
            let total_duration = 0;
            let mob_count = 0;
            let mob_duration = 0;
            let land_count = 0;
            let land_duration = 0;

            let obj = {};

            for (let i = 0; i < data.length; i++) {
                let tmp = {};
                if (data[i]['term_use'] == 2) {
                    mob_count = mob_count + parseInt(data[i]['total_calls'], 10);
                    mob_duration = mob_duration + parseFloat(data[i]['total_duration']);
                }
                if (data[i]['term_use'] == 1) {
                    land_count = land_count + parseInt(data[i]['total_calls'], 10);
                    land_duration = land_duration + parseFloat(data[i]['total_duration']);
                }
                // obj[data[i]['daily_batch']]='MainId';

                if (obj.hasOwnProperty(data[i]['daily_batch'])) {
                    if (data[i]['term_use'] == 2) {
                        obj[data[i]['daily_batch']]['mob_count'] = data[i]['total_calls'];
                        obj[data[i]['daily_batch']]['mob_duration'] = data[i]['total_duration'];
                    }
                    if (data[i]['term_use'] == 1) {
                        obj[data[i]['daily_batch']]['land_count'] = data[i]['total_calls'];
                        obj[data[i]['daily_batch']]['land_duration'] = data[i]['total_duration'];
                    }

                } else {

                    if (data[i]['term_use'] == 2) {
                        tmp['mob_count'] = data[i]['total_calls'];
                        tmp['mob_duration'] = data[i]['total_duration'];
                    }
                    if (data[i]['term_use'] == 1) {
                        tmp['land_count'] = data[i]['total_calls'];
                        tmp['land_duration'] = data[i]['total_duration'];

                    }

                    obj[data[i]['daily_batch']] = tmp;

                }



                total_count = total_count + parseInt(data[i]['total_calls'], 10);
                total_duration = total_duration + parseFloat(data[i]['total_duration']);

            }

            console.log("obj==" + JSON.stringify(obj));

            for (const keys in obj) {
                // console.log(`${property}: ${object[property]}`);

                let mob_count = 0;
                let mob_duration = 0;
                let land_count = 0;
                let land_duration = 0;

                if (obj[keys].mob_count) {
                    mob_count = obj[keys].mob_count;
                }

                if (obj[keys].land_count) {
                    land_count = obj[keys].land_count;
                }
                if (obj[keys].mob_duration) {
                    mob_duration = obj[keys].mob_duration;
                }
                if (obj[keys].land_duration) {
                    land_duration = obj[keys].land_duration;
                }
                let totalCalls = parseInt(land_count, 10) + parseInt(mob_count, 10);
                let totalDuration = parseFloat(land_duration) + parseFloat(mob_duration);

                let query = `insert into kickback_traffic_summary (customer_cd ,main_id, traffic_date,kotei_cnt, kotei_min
                    ,keitai_cnt,keitai_min,all_cnt,all_min) VALUES('${kick_company}', '${keys}', '${targetDate}', 
                    '${land_count}','${land_duration}','${mob_count}','${mob_duration}',
                    '${totalCalls}','${totalDuration}')`;
                await db.queryIBS(query, []);
            }

            // let query = `insert into kickback_traffic_summary (customer_cd ,main_id, traffic_date,kotei_cnt, kotei_min
            // ,keitai_cnt,keitai_min,all_cnt,all_min) VALUES('${kick_company}', '0', '${targetDate}', 
            // '${land_count}','${land_duration}','${mob_count}','${mob_duration}','${total_count}','${total_duration}')`;

            // //console.log("query==" + query);

            // let insertTrafficSummaryRes = await db.queryIBS(query, []);

        } catch (error) {
            console.log("Error in result ---" + error.message);
            return error;
        }
    },


    getSummaryData: async function (targetMonth, kick_company) {
        console.log("target month=" + targetMonth);

        const year = new Date(targetMonth).getFullYear();
        let month = new Date(targetMonth).getMonth() + 1;
        if (parseInt(month, 10) < 10) {
            month = '0' + month;
        }

        try {
            const query = `select customer_cd, main_id, traffic_date::date, kotei_cnt, kotei_min::int, keitai_cnt, 
            keitai_min::int, all_cnt, all_min::int from kickback_traffic_summary where to_char(traffic_date, 'MM-YYYY') = '${month}-${year}' 
            and customer_cd ='${kick_company}' order by traffic_date::date asc `;
            const ratesRes = await db.queryIBS(query, []);

            if (ratesRes.rows) {
                return (ratesRes.rows);
            }
            return { err: 'not found' };
        } catch (error) {
            return error;
        }
    },

    getSummaryDataMultiple: async function (targetMonth, kick_company, mainId) {
        console.log("target month=" + targetMonth);

        const year = new Date(targetMonth).getFullYear();
        let month = new Date(targetMonth).getMonth() + 1;
        if (parseInt(month, 10) < 10) {
            month = '0' + month;
        }

        try {
            const query = ` select customer_cd, main_id, traffic_date::date, sum(kotei_cnt) as kotei_cnt, sum(kotei_min::int)as kotei_min  , 
            sum(keitai_cnt) as keitai_cnt,
            sum(keitai_min::int) as keitai_min, sum(all_cnt) as all_cnt, sum(all_min::int) as all_min from  kickback_traffic_summary 
            where to_char(traffic_date, 'MM-YYYY') = '${month}-${year}' 
            and customer_cd ='${kick_company}' and main_id='${mainId}' group by customer_cd, main_id, traffic_date::date order by traffic_date::date asc `;
            const ratesRes = await db.queryIBS(query, []);

            if (ratesRes.rows) {
                return (ratesRes.rows);
            }
            return { err: 'not found' };
        } catch (error) {
            return error;
        }
    },


    getSummaryDataMysql: async function (targetDateWithTimezone) {

        const day = new Date(targetDateWithTimezone).getDate();

        const startDate = new Date(targetDateWithTimezone);

        startDate.setDate(startDate.getDate() - day);
        const year = startDate.getFullYear();
        const month = startDate.getMonth() + 1;
        const date = startDate.getDate();
        const actualStartDate = year + "-" + month + "-" + date + " 15:00:00";

        // console.log("year==" + year + "\n month==" + month + "\n day=" + day);
        // console.log("start Date=" + startDate);
        // console.log("actual start date" + actualStartDate)


        try {
            const query = `select count(*) as total, sum(CALLDURATION*0.01/60) as duration  ,cast(addtime(starttime,'09:00:00') as Date) as day from COLLECTOR_73 
            where  ((INCALLEDNUMBER LIKE '35050%') OR (INCALLEDNUMBER LIKE '36110%') OR (INCALLEDNUMBER LIKE '50505%')) 
            AND RECORDTYPEID = 3 
            AND (CALLDURATION > 0)
            AND (INGRPSTNTRUNKNAME IN ('IPSFUS10NWJ','IPSKRG5A00J','IPSKRG6BIIJ','IPSSHGF59EJ','IPSSHG5423J7') )
            AND starttime>='${actualStartDate}' and starttime <'${targetDateWithTimezone}' 
            group by cast(addtime(starttime,'09:00:00') as Date) 
            order by cast(addtime(starttime,'09:00:00') as Date) asc`;
            //console.log(query);
            const rawData = await db.mySQLQuery(query, []);
            //console.log(JSON.stringify(rawData));
            return (rawData);
        } catch (error) {
            return error;
        }
    },
    createTable: async function (processData, title, customerInfo) {

        let proDataLen = processData.length;
        let html = '';
        let table = '';

        console.log("proData=" + proDataLen);
        html = tableCreate(processData, customerInfo);
        console.log("html");
        //console.log(html);

        return html;
    },
    createTableMultiple: async function (processData, title_name) {

        let proDataLen = processData.length;
        let html = '';
        let table = '';

        console.log("proData=" + proDataLen);
        html = tableCreateMultiple(processData, title_name);
        console.log("html");
        //console.log(html);

        return html;
    },
    createHTMLForAllData: async function (processData, rawData) {

        let proDataLen = processData.length;
        let rawDataLen = rawData.length;

        if (proDataLen != rawDataLen) {
            return null;
        }

        let html = '';
        let table = '';

        console.log("proData=" + proDataLen);
        html = tableCreateAllData(processData, rawData);
        console.log("html");
        //console.log(html);

        return html;
    },
    sendEmail: async function (html, customerInfo) {
        if (customerInfo) {
            let subject = `販売促進トラフィック速報 (${customerInfo['title_name']})`;

            let emailTO = `${customerInfo['mail_address']}`;
            let emailCC = `${customerInfo['east_link_address']}`;

          //  emailTO = 'uday@ipsism.co.jp';
          //  emailCC = 'uday@ipsism.co.jp';
            
            if (!emailTO) {
                emailTO = "uday@ipsism.co.jp";
                console.log("i amin ")
            }

            if (!emailCC) {
                emailCC = "";
            }


            let mailOption = {
                from: 'relay@sysmail.elijp.tokyo',
                to: emailTO,
                cc: emailCC,
              //  cc: 'y_ito@ipsism.co.jp',
                bcc: 'ips_tech@ipsism.co.jp,telecom@ipsism.co.jp',
               
                subject,
                html
            }

           utility.sendEmail(mailOption);
        }


    },
    sendEmailAllData: async function (html, subject) {

       // let subject = `BATCH: 03/050 CDR BALANCE CHECK MONITORING New`;
        let mailOption = {
            from: 'ips_tech@sysmail.ipsism.co.jp',
            to: 'uday@ipsism.co.jp',
            cc: 'y_ito@ipsism.co.jp',
            //     cc:'gaurav@ipsism.co.jp,abhilash@ipsism.co.jp,vijay@ipsism.co.jp',
            subject,
            html
        }

        utility.sendEmail(mailOption);



    },

}


function tableCreate(processData, customerInfo) {
    console.log("create table---" + processData.length);
    let tableRows = '';
    let koteiCount = 0;
    let koteiMin = 0;
    let keitaiCount = 0;
    let keitaiMin = 0;
    let allCnt = 0;
    let allMin = 0;
    let html = '';
    let table = '';
    try {
        for (let i = 0; i < processData.length; i++) {

            // let loc = new Date(processData[i]['traffic_date']);
            //let locArr = loc.toLocaleString().split(",");

            tableRows += '<tr>';
            tableRows += `<td class="day">${utility.formatDate(processData[i]['traffic_date'])}</td>`;
            tableRows += `<td style="text-align:right" class="koteiCount">${utility.numberWithCommas(processData[i]['kotei_cnt'])}</td>`;
            tableRows += `<td style="text-align:right" class="koteiMin">${utility.numberWithCommas(processData[i]['kotei_min'])}</td>`;
            tableRows += `<td style="text-align:right" class="keitaiCount">${utility.numberWithCommas(processData[i]['keitai_cnt'])}</td>`;
            tableRows += `<td style="text-align:right" class="keitaiMin">${utility.numberWithCommas(processData[i]['keitai_min'])}</td>`;
            tableRows += `<td style="text-align:right" class="allCnt">${utility.numberWithCommas(processData[i]['all_cnt'])}</td>`;
            tableRows += `<td style="text-align:right" class="allMin">${utility.numberWithCommas(processData[i]['all_min'])}</td>`;

            tableRows = tableRows + '</tr>'
            koteiCount = koteiCount + parseInt(processData[i]['kotei_cnt'], 10);
            koteiMin = koteiMin + parseInt(processData[i]['kotei_min'], 10);
            keitaiCount = keitaiCount + parseInt(processData[i]['keitai_cnt'], 10);

            keitaiMin = keitaiMin + parseInt(processData[i]['keitai_min'], 10);
            allCnt = allCnt + parseInt(processData[i]['all_cnt'], 10);
            allMin = allMin + parseInt(processData[i]['all_min'], 10);

        }


        tableRows += '<tr>';
        tableRows += `<td class="day">合　計</td>`;
        tableRows += `<td style="text-align:right" class="koteiCount">${utility.numberWithCommas(koteiCount)}</td>`;
        tableRows += `<td style="text-align:right" class="koteiMin">${utility.numberWithCommas(koteiMin)}</td>`;
        tableRows += `<td style="text-align:right" class="keitaiCount">${utility.numberWithCommas(keitaiCount)}</td>`;
        tableRows += `<td style="text-align:right" class="keitaiMin">${utility.numberWithCommas(keitaiMin)}</td>`;
        tableRows += `<td style="text-align:right" class="allCnt">${utility.numberWithCommas(allCnt)}</td>`;
        tableRows += `<td style="text-align:right" class="allMin">${utility.numberWithCommas(allMin)}</td>`;

        console.log("inside-1")

        let h4 = `いつもお世話になっております。, <br /> <br /> 販売促進トラフィック状況を送信致します。 <br /> <br />
        よろしくお願いします。 <br /><br /> <p style="color:red">※本メールはシステムより自動的に送信されていますので、返信はしないでください。</p> 
<br />`;
        html += h4;

        let header = `<div style="style="margin: auto;width: 100%;padding: 10px;"><p style="text-align:left">(${customerInfo['title_name']})</p></div> `;
        html += header;

        const style = `thead { text-align: left;background-color: #4CAF50; color: white; }`


        table += `<table class='some-table' border="2" style='${style}'>
             <thead> <tr> 
             <th>DATE</th> <th>固定件数</th> <th>固定分数</th> <th> 携帯件数 </th>
             <th>携帯分数</th> <th>全体件数</th> <th>全体分数</th>
             </tr> </thead>
        <tbody>
        ${tableRows}    
        </tbody>
        </table>`;
        console.log("inside1")

    } catch (err) {
        throw Error("Error !" + err.message);
    }
    let div = `<div style="margin: auto;width: 100%;">${table}</div>`;
    html += div;
    html += "Thank you";
    // console.log("sdfsdf"+html);

    return html;
}


function tableCreateMultiple(processData, title_name) {
    console.log("create table---" + processData.length + title_name);
    let tableRows = '';
    let koteiCount = 0;
    let koteiMin = 0;
    let keitaiCount = 0;
    let keitaiMin = 0;
    let allCnt = 0;
    let allMin = 0;
    let html = '';
    let table = '';
    try {
        for (let i = 0; i < processData.length; i++) {

            // let loc = new Date(processData[i]['traffic_date']);
            //let locArr = loc.toLocaleString().split(",");

            tableRows += '<tr>';
            tableRows += `<td class="day">${utility.formatDate(processData[i]['traffic_date'])}</td>`;
            tableRows += `<td style="text-align:right" class="koteiCount">${utility.numberWithCommas(processData[i]['kotei_cnt'])}</td>`;
            tableRows += `<td style="text-align:right" class="koteiMin">${utility.numberWithCommas(processData[i]['kotei_min'])}</td>`;
            tableRows += `<td style="text-align:right" class="keitaiCount">${utility.numberWithCommas(processData[i]['keitai_cnt'])}</td>`;
            tableRows += `<td style="text-align:right" class="keitaiMin">${utility.numberWithCommas(processData[i]['keitai_min'])}</td>`;
            tableRows += `<td style="text-align:right" class="allCnt">${utility.numberWithCommas(processData[i]['all_cnt'])}</td>`;
            tableRows += `<td style="text-align:right" class="allMin">${utility.numberWithCommas(processData[i]['all_min'])}</td>`;

            tableRows = tableRows + '</tr>'
            koteiCount = koteiCount + parseInt(processData[i]['kotei_cnt'], 10);
            koteiMin = koteiMin + parseInt(processData[i]['kotei_min'], 10);
            keitaiCount = keitaiCount + parseInt(processData[i]['keitai_cnt'], 10);

            keitaiMin = keitaiMin + parseInt(processData[i]['keitai_min'], 10);
            allCnt = allCnt + parseInt(processData[i]['all_cnt'], 10);
            allMin = allMin + parseInt(processData[i]['all_min'], 10);

        }


        tableRows += '<tr>';
        tableRows += `<td class="day">合　計</td>`;
        tableRows += `<td style="text-align:right" class="koteiCount">${utility.numberWithCommas(koteiCount)}</td>`;
        tableRows += `<td style="text-align:right" class="koteiMin">${utility.numberWithCommas(koteiMin)}</td>`;
        tableRows += `<td style="text-align:right" class="keitaiCount">${utility.numberWithCommas(keitaiCount)}</td>`;
        tableRows += `<td style="text-align:right" class="keitaiMin">${utility.numberWithCommas(keitaiMin)}</td>`;
        tableRows += `<td style="text-align:right" class="allCnt">${utility.numberWithCommas(allCnt)}</td>`;
        tableRows += `<td style="text-align:right" class="allMin">${utility.numberWithCommas(allMin)}</td>`;


        const style = `thead { text-align: left;background-color: #4CAF50; color: white; }`

        let header = `<div style="style="margin: auto;width: 100%;padding: 10px;"><p style="text-align:left">(${title_name})</p></div> `;
        html += header;



        table += `<table class='some-table' border="2" style='${style}'>
             <thead> <tr> 
             <th>DATE</th> <th>固定件数</th> <th>固定分数</th> <th> 携帯件数 </th>
             <th>携帯分数</th> <th>全体件数</th> <th>全体分数</th>
             </tr> </thead>
        <tbody>
        ${tableRows}    
        </tbody>
        </table>`;
        console.log("inside1")

    } catch (err) {
        throw Error("Error !" + err.message);
    }
    let div = `<div style="margin: auto;width: 100%;">${table}</div>`;
    html += div;

    // console.log("sdfsdf"+html);

    return html;
}


function tableCreateAllData(processData, rawData) {
    console.log("create table all data---");
    let tableRows = '';

    let length = rawData.length, locS, locSA, locE, locEA;

    locS = new Date(rawData[0]['day']);
    locSA = locS.toLocaleString().split(",");
    locE = new Date(rawData[length - 1]['day']);
    locEA = locE.toLocaleString().split(",");

    //    console.log("1="+locEA[0]);

    for (let i = 0; i < rawData.length; i++) {
        let diff = rawData[i]['total'] - processData[i]['total'];
        let total_not_16_31 = processData[i]['total'] - processData[i]['total_16_31'];

        let rawValue = utility.numberWithCommas(rawData[i]['total']);
        let processValue = utility.numberWithCommas(processData[i]['total']);
        let total_16_31 = utility.numberWithCommas(processData[i]['total_16_31']);


        tableRows += '<tr>';
        tableRows += `<td class="day">${utility.formatDate(rawData[i]['day'])}</td>`;
        tableRows += `<td style="text-align:right" class="Raw Data">${rawValue}</td>`;
        tableRows += `<td style="text-align:right" class="Processed Data">${processValue}</td>`;
        tableRows += `<td style="text-align:right" class="Difference">${diff}</td>`;
        tableRows += `<td style="text-align:right" class="Processed Data">${total_16_31}</td>`;
        tableRows += `<td style="text-align:right" class="Difference">${total_not_16_31}</td>`;

        tableRows = tableRows + '</tr>'
    }
    let html = '';
    let h4 = `Hi, <br /> This is the daily  CDR Report!! <br /><br />`;
    let h3 = `${locSA[0]} ~ ${locEA[0]} !! `;
    let h2 = `<h2 align="center"> 03/050 CDRの  </h2>`;
    html += h4;
    html += h3;
    html += h2;
    let table = '';
    const style = `thead { text-align: left;background-color: #4CAF50; color: white; }`

    try {
        table += `<table class='some-table' border="2" style='${style}'>
             <thead> <tr> 
                <th>DATE</th>
                <th>COLLECTOR(10.168.11.252)</th> 
                <th>SONUSCDR(PRO)(10.168.22.40)</th> 
                <th> DIFFERENCE </th>
                
                <th>[192.168.11.78]SONUSCDR(16, 31)</th> 
                <th>[192.168.11.78]SONUSCDR(NOT 16, 31)</th> 
                    
             </tr> </thead>
        <tbody>
        ${tableRows}    
        </tbody>
        </table>`;


    } catch (err) {
        throw Error("Error !" + err);
    }
    let div = `<div style="margin: auto;width: 100%;padding: 0px;">${table}</div>`;
    html += div;
    html += "Thank you";
    // console.log("sdfsdf"+html);

    return html;
}