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
            if (mulitple) {
                query = `delete FROM kickback_traffic_summary where traffic_date::date = '${targetDate}'::date 
                and customer_cd ='${kick_company}' and main_id!='0'`;

            } else {
                query = `delete FROM kickback_traffic_summary where traffic_date::date = '${targetDate}'::date 
                and customer_cd ='${kick_company}' and main_id='0'`;

            }
            const deleteTrafficSummaryRes = await db.queryIBS(query, []);
            return deleteTrafficSummaryRes;
        } catch (error) {
            return error;
        }
    },
    getAllKickComp: async function (targetDate, billcdrTableName) {
        try {
            console.log("in get all kick comp");
            const query = ` select distinct(kick_company) as customer_cd from ${billcdrTableName}  order by kick_company`;
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
            const query = ` select * from kickback_cdr_carrier where ( east_link_flag=1 and mail_address!='') OR (email_type='multiple') order by customer_cd`;
            const kickCompRes = await db.queryIBS(query, []);
            return kickCompRes.rows;

        } catch (error) {
            console.log("err in getting kick company  =" + error.message);
            return error;
        }
    },
    getAllProTrafficSummary: async function (tableNameBillCDR, targetMonth) {
        console.log("in all sum")
        const year = new Date(targetMonth).getFullYear();
        let month = new Date(targetMonth).getMonth() + 1;
        if (parseInt(month, 10) < 10) {
            month = '0' + month;
        }
        try {
            const query = `select count(*) as total,  sum(case when (call_status =16 OR call_status =31) then 1 else 0 end)  as total_16_31,
             start_time::Date as day from ${tableNameBillCDR} where to_char(start_time, 'MM-YYYY') = '${month}-${year}' 
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
            console.log("error" + error.message)
            return error;
        }
    },

    getTrafficSummary: async function (tableNameBillCDR, kickCompany, targetDate) {
        try {
            const query = `select count(*) as total_calls, sum(duration/60) as total_duration, term_use, kick_company
            from ${tableNameBillCDR} where start_time::date = '${targetDate}'::date and kick_company='${kickCompany}' and duration>1 group by term_use,kick_company `;
            const getTrafficSummaryRes = await db.queryIBS(query, []);
            return getTrafficSummaryRes.rows;
        } catch (error) {
            return error;
        }
    },
    getTrafficSummaryMultiple: async function (tableNameBillCDR, kickCompany, targetDate) {
        try {
            const query = `select count(*) as total_calls, sum(duration/60) as total_duration, term_use, kick_company, daily_batch from
             (select duration, term_use, kick_company, term_ani from ${tableNameBillCDR} where start_time::date = '${targetDate}'::date and
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
    getSonusSummaryTotalData: async function (year, month, tableName) {
        try {

            const query = `select count(*) as total, start_time::date as day
            from ${tableName} where to_char(start_time, 'MM-YYYY') = '${month}-${year}'
            group by start_time::date order by start_time::Date `;

            const getSonusSummaryRes = await db.query(query, []);
            return getSonusSummaryRes.rows;
        } catch (error) {
            return error;
        }
    },


    getSonusSummaryByTermaniTotalData: async function (year, month, tableName) {
        try {
            const query = `select count(*) as total, start_time::date as day,
            sum(case when (sonus_callstatus::int =16 OR sonus_callstatus::int =31) then 1 else 0 end)  as total_16_31
            from ${tableName} where to_char(start_time, 'MM-YYYY') = '${month}-${year}' 
            AND ((TERM_ANI ILIKE '35050%') OR (TERM_ANI ILIKE '36110%') OR (TERM_ANI ILIKE '50505%'))
            group by start_time::date order by start_time::Date `;

            const getSonusSummaryRes = await db.query(query, []);
            return getSonusSummaryRes.rows;
        } catch (error) {
            console.log("error in sonus sougu data" + error.message);
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

    getCDRDailyTransitionSummary: async function (tableNameBillCDR, year, month) {
        try {
            const query = ` select start_time::date as day, gw as GATEWAY, trunk_port_name, count(*) as CDRCOUNT, sum(call_type) as KOKUSAI, 
            count(*) - sum(call_type) as KOKUNAI, sum(in_outbound) as INBOUND, count(*) - sum(in_outbound) as OUTBOUND, 
            sum(DURATION) as DURATIONS,sum(case when company_code='9999999999' then 1 else 0 end) as fumeichk
            from ${tableNameBillCDR} where to_char(start_time,'MM-YYYY') = '${month}-${year}' 
            group by start_time::date , GATEWAY, trunk_port_name 
            order by start_time::date , GATEWAY,trunk_port_name `;

            const cdrDailyTransitionSummaryData = await db.queryIBS(query, []);
            return cdrDailyTransitionSummaryData.rows;
        } catch (error) {
            console.log("error in ")
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
        } catch (error) {
            console.log("Error in result ---" + error.message);
            return error;
        }
    },

    getTableName: async function (targetDate, __type) {
        try {
            const year = new Date(targetDate).getFullYear();
            let month = new Date(targetDate).getMonth() + 1;

            if (parseInt(month, 10) < 10) {
                month = '0' + month;
            }
            if(__type === 'billcdr'){
                return `billcdr_${year}${month}`;
            }else{
                return `cdr_${year}${month}`;
            }
            

        } catch (e) {
            console.log("err in get table=" + e.message);
            return console.error(e);
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
            sum(keitai_cnt) as keitai_cnt,sum(keitai_min::int) as keitai_min, sum(all_cnt) as all_cnt, sum(all_min::int) as all_min from 
            kickback_traffic_summary where to_char(traffic_date, 'MM-YYYY') = '${month}-${year}' 
            and customer_cd ='${kick_company}' and main_id='${mainId}' group by customer_cd, main_id, traffic_date::date 
            order by traffic_date::date asc `;
            const ratesRes = await db.queryIBS(query, []);

            if (ratesRes.rows) {
                return (ratesRes.rows);
            }
            return { err: 'not found' };
        } catch (error) {
            return error;
        }
    },


    getSummaryDataByDayMysql: async function (targetDateWithTimezone) {

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

                //  console.log("year==" + year + "\n month==" + month + "\n day=" + day);
                //  console.log("start Date=" + startDate);
                //  console.log("actual start date" + actualStartDate)

                let query = `select count(*) as total, sum(CALLDURATION*0.01/60) as duration  ,cast(addtime(starttime,'09:00:00') as Date) as day 
                from COLLECTOR_73 
                where  ((INCALLEDNUMBER LIKE '35050%') OR (INCALLEDNUMBER LIKE '36110%') OR (INCALLEDNUMBER LIKE '50505%')) 
                AND RECORDTYPEID = 3 
                AND (CALLDURATION > 0)
                AND (INGRPSTNTRUNKNAME IN ('IPSFUS10NWJ','IPSKRG5A00J','IPSKRG6BIIJ','IPSSHGF59EJ','IPSSHG5423J7') )
                AND starttime>='${actualStartDate}' and startTime < DATE_ADD("${actualStartDate}", INTERVAL 1 DAY) 
                group by cast(addtime(starttime,'09:00:00') as Date) 
                order by cast(addtime(starttime,'09:00:00') as Date) asc`;
                let rawData = await db.mySQLQuery(query, []);
                //let rawData=[];
                if (rawData.length) {
                    resData = [...resData, rawData[0]];
                }
                //console.log(query);
            }

            //resData = [{"total":1374132,"duration":1972270.896309,"day":"2022-01-01T00:00:00.000Z"},{"total":1344112,"duration":2158370.930815,"day":"2022-01-02T00:00:00.000Z"},{"total":1336945,"duration":2417055.553657,"day":"2022-01-03T00:00:00.000Z"},{"total":1126644,"duration":2338637.088063,"day":"2022-01-04T00:00:00.000Z"},{"total":1140253,"duration":2382613.26394,"day":"2022-01-05T00:00:00.000Z"},{"total":1142858,"duration":2403703.565325,"day":"2022-01-06T00:00:00.000Z"},{"total":1139253,"duration":2379654.680957,"day":"2022-01-07T00:00:00.000Z"},{"total":1350310,"duration":2339725.713362,"day":"2022-01-08T00:00:00.000Z"},{"total":1352532,"duration":2367783.447158,"day":"2022-01-09T00:00:00.000Z"},{"total":1350580,"duration":2362425.632064,"day":"2022-01-10T00:00:00.000Z"},{"total":1142536,"duration":2415127.561747,"day":"2022-01-11T00:00:00.000Z"},{"total":1136206,"duration":2445915.004746,"day":"2022-01-12T00:00:00.000Z"},{"total":1122329,"duration":2457239.441399,"day":"2022-01-13T00:00:00.000Z"},{"total":1132660,"duration":2470412.022058,"day":"2022-01-14T00:00:00.000Z"},{"total":1340929,"duration":2469724.833589,"day":"2022-01-15T00:00:00.000Z"},{"total":1350807,"duration":2616313.452486,"day":"2022-01-16T00:00:00.000Z"},{"total":1350807,"duration":2616313.452486,"day":"2022-01-17T00:00:00.000Z"}]

            //console.log(JSON.stringify(resData));
            return (resData);
        } catch (error) {
            console.log("test...")
            return error;
        }
    },

    getSummaryDataByDayTotalMysql: async function (targetDateWithTimezone) {
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

                let query = `select count(*) as total, cast(addtime(starttime,'09:00:00') as Date) as
                 day from COLLECTOR_73 
                where  RECORDTYPEID = 3 
                AND (CALLDURATION > 0)
                AND (INGRPSTNTRUNKNAME IN ('IPSFUS10NWJ','IPSKRG5A00J','IPSKRG6BIIJ','IPSSHGF59EJ','IPSSHG5423J7') )
                AND starttime>='${actualStartDate}' and startTime < DATE_ADD("${actualStartDate}", INTERVAL 1 DAY) 
                group by cast(addtime(starttime,'09:00:00') as Date) 
                order by cast(addtime(starttime,'09:00:00') as Date) asc`;
                let rawData = await db.mySQLQuery(query, []);
                if (rawData.length) {
                    resData = [...resData, rawData[0]];
                }
            }
            return (resData);
        } catch (error) {
            return error;
        }
    },

    createTable: async function (processData, title, customerInfo) {
        let proDataLen = processData.length;
        let html = '';
        console.log("proData=" + proDataLen);
        html = tableCreate(processData, customerInfo);
        console.log("html");
        return html;
    },
    createTableMultiple: async function (processData, title_name) {

        let proDataLen = processData.length;
        let html = '';
        console.log("proData=" + proDataLen);
        html = tableCreateMultiple(processData, title_name);
        console.log("html");
        return html;
    },
    createHTMLForAllData: async function (collect_73, sonusData, collect_73_sougo, sonusProData, sonusPro_16_31_Data, billCdrData, year, month) {

        let proDataLen = collect_73.length;
        let rawDataLen = sonusData.length;

        if (proDataLen != rawDataLen) {
            return null;
        }

        let html = '';
        console.log("proData=" + proDataLen);
        html = tableCreateAllData(collect_73, sonusData, collect_73_sougo, sonusProData, sonusPro_16_31_Data, billCdrData, year, month);
        console.log("html");
        return html;
    },

    createHTMLCDRDailyTransistion: async function (data, year, month) {
        if (!data.length) {
            return null
        }
        let html = '';
        html = tableCDRDailyTransistion(data, year, month);
        return html;
    },
    sendEmail: async function (html, customerInfo) {
        if (customerInfo) {
            let subject = `販売促進トラフィック速報 (${customerInfo['title_name']})`;
            let emailTO = `${customerInfo['mail_address']}`;
            let emailCC = `${customerInfo['east_link_address']}`;

              //emailTO = 'uday@ipspro.co.jp';
              //emailCC = 'uday@ipspro.co.jp';
            //  emailCC = 'y_ito@ipspro.co.jp';

            if (!emailTO) {
                emailTO = "uday@ipspro.co.jp";
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
                bcc: 'uday@ipspro.co.jp,telecom@ipspro.co.jp',

                subject,
                html
            }
            utility.sendEmail(mailOption);
        }
    },
    sendEmailAllData: async function (html, subject) {
        let mailOption = {
            from: 'ips_tech@sysmail.ipsism.co.jp',
            to: 'telecom@ipspro.co.jp',
            //to: 'uday@ipspro.co.jp',
            cc: 'y_ito@ipspro.co.jp,uday@ipspro.co.jp',
            //cc: 'uday@ipspro.co.jp',
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
        tableRows += `<td class="day">合計</td>`;
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
        tableRows += `<td class="day">合計</td>`;
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
    return html;
}


function tableCreateAllData(collect_73, sonusData, collect_73_sougo, sonusProData, sonusPro_16_31_Data, billCdrData, year, month) {
    console.log("create table all data---");
    let tableRows = '';

    let length = collect_73.length, locS, locSA, locE, locEA;

    locS = new Date(collect_73[0]['day']);
    locSA = locS.toLocaleString().split(",");
    locE = new Date(collect_73[length - 1]['day']);
    locEA = locE.toLocaleString().split(",");

    //    console.log("1="+locEA[0]);

    for (let i = 0; i < collect_73.length; i++) {

        let rawDiffDataCount = collect_73[i]['total'] - sonusData[i]['total'];
        let rawDataTotalCount = utility.numberWithCommas(collect_73[i]['total']);
        let proDataTotalCount = utility.numberWithCommas(sonusData[i]['total']);


        let sougoDataDiffCount = collect_73_sougo[i]['total'] - sonusProData[i]['total'];
        let sougoRawDataCount = utility.numberWithCommas(collect_73_sougo[i]['total']);
        let sougoProDataCount = utility.numberWithCommas(sonusProData[i]['total']);


        let total_16_31 = utility.numberWithCommas(sonusPro_16_31_Data[i]['total_16_31']);
        let total_not_16_31 = utility.numberWithCommas(parseInt(sonusPro_16_31_Data[i]['total'], 10) - parseInt(sonusPro_16_31_Data[i]['total_16_31'], 10));

        let sonusCDRProDataCount = utility.numberWithCommas(sonusProData[i]['total']);
        let billCDRProDataCount = utility.numberWithCommas(billCdrData[i]['total']);
        let billCDRCountDiff = sonusProData[i]['total'] - billCdrData[i]['total'];

        tableRows += '<tr>';
        tableRows += `<td class="day">${utility.formatDate(collect_73[i]['day'])}</td>`;

        tableRows += `<td style="text-align:right" class="Raw Data">${rawDataTotalCount}</td>`;
        tableRows += `<td style="text-align:right" class="Processed Data">${proDataTotalCount}</td>`;
        tableRows += `<td style="text-align:right" class="Difference">${rawDiffDataCount}</td>`;

        tableRows += `<td style="text-align:right" class="Raw Data">${sougoRawDataCount}</td>`;
        tableRows += `<td style="text-align:right" class="Processed Data">${sougoProDataCount}</td>`;
        tableRows += `<td style="text-align:right" class="Difference">${sougoDataDiffCount}</td>`;

        tableRows += `<td style="text-align:right" class="Processed Data">${total_16_31}</td>`;
        tableRows += `<td style="text-align:right" class="Difference">${total_not_16_31}</td>`;


        tableRows += `<td style="text-align:right" class="Raw Data">${sonusCDRProDataCount}</td>`;
        tableRows += `<td style="text-align:right" class="Processed Data">${billCDRProDataCount}</td>`;

        tableRows += `<td style="text-align:right" class="Difference">${billCDRCountDiff}</td>`;

        tableRows = tableRows + '</tr>'
    }
    let html = '';
    let h4 = `Hi, <br /> This is the daily  CDR Report!! <br /><br />`;
    let h3 = `${utility.formatDate(locSA[0])} ~ ${utility.formatDate(locEA[0])} !! `;
    let h2 = `<h2 align="center"> ${year} 年${month}月度のCOLLECTOR TABLE CDR件数  </h2>`;
    html += h4;
    html += h3;
    html += h2;
    let table = '';
    const style = `thead { text-align: left;background-color: #4CAF50; color: white; }`



    try {
        table += `<table class='some-table' border="2" style='${style}'>
             <thead>
              <tr> 
                <th>DATE</th>
                <th colspan="2">RAW CDR BACKUP</th>
                <th> 差異 </th>
                
                <th colspan="2">035050/036110/050505 CDR</th>
                <th> 差異 </th>

                <th colspan="4">035050/036110/050505 請求処理</th>
                <th> 差異 </th>

             </tr> 
             <tr>
             <th></th>
             <th>COLLECTOR (10.168.11.252)</th>
             <th>SONUSCDR (10.168.11.41)</th>
             <th></th>
             <th>COLLECTOR (10.168.11.252)</th>
             <th>SONUSCDR (10.168.11.41)</th>
             <th></th>
             <th>SONUSCDR(16,31) (10.168.11.41)</th>
             <th>SONUSCDR(NOT 16,31) (10.168.11.41)</th>
             <th>SONUSCDR (10.168.11.41)</th>
             <th>BILLCDR MAIN (10.168.11.41)</th>
             <th></th>
             </tr>
             
             </thead>
        <tbody>
        ${tableRows}    
        </tbody>
        </table>`;


    } catch (err) {
        throw Error("Error !" + err);
    }
    let div = `<div style="margin: auto;width: 100%;">${table}</div>`;


    html += div;
    html += "Thank you";
    // console.log("sdfsdf"+html);

    return html;
}

function tableCDRDailyTransistion(data, year, month) {
    console.log("create table all data---");

    try {

        let tableRows = '', cdrcountSumAll = 0, kokusaiSumAll = 0, kokunaiSumAll = 0, inboundSumAll = 0, outboundSumAll = 0, durationsSumAll = 0, fumeichkSumAll = 0;

        let length = data.length, locS, locSA, locE, locEA;

        locS = new Date(data[0]['day']);
        locSA = locS.toLocaleString().split(",");
        locE = new Date(data[length - 1]['day']);
        locEA = locE.toLocaleString().split(",");

        //    console.log("1="+locEA[0]);


        let tmpObj = {}

        data.forEach((obj) => {
            let startDay = new Date(obj['day']).getDate();
            tmpObj[startDay] = 1;
        })

        Object.keys(tmpObj).forEach(ele => {

            let filteredData = data.filter(obj => (
                new Date(obj['day']).getDate() == ele ? true : false
            ))
            let { tableRow, cdrcountSum, kokusaiSum, kokunaiSum, inboundSum, outboundSum, durationsSum, fumeichkSum } = rowData(filteredData);
            tableRows += tableRow;
            cdrcountSumAll += cdrcountSum;
            kokusaiSumAll += kokusaiSum;
            kokunaiSumAll += kokunaiSum;
            inboundSumAll += inboundSum;
            outboundSumAll += outboundSum;
            durationsSumAll += durationsSum;
            fumeichkSumAll += fumeichkSum;

        })

        tableRows += `<tr style="font-weight:bold"> `;

        tableRows += `<td class="day"></td>`;
        tableRows += `<td class="day"></td>`;
        tableRows += `<td class="day">合計</td>`;
        tableRows += `<td style="text-align:right" class="cdrcount">${utility.numberWithCommas(cdrcountSumAll)}</td>`;

        tableRows += `<td style="text-align:right" class="kokusai">${utility.numberWithCommas(kokusaiSumAll)}</td>`;
        tableRows += `<td style="text-align:right" class="kokunai">${utility.numberWithCommas(kokunaiSumAll)}</td>`;
        tableRows += `<td style="text-align:right" class="inbound">${utility.numberWithCommas(inboundSumAll)}</td>`;

        tableRows += `<td style="text-align:right" class="outbound">${utility.numberWithCommas(outboundSumAll)}</td>`;
        tableRows += `<td style="text-align:right" class="durations">${utility.numberWithCommas(durationsSumAll.toFixed(1))}</td>`;
        tableRows += `<td style="text-align:right" class="durations">${utility.numberWithCommas(fumeichkSumAll)}</td>`;

        tableRows += '</tr>'


        let html = '';
        let h4 = `お疲れ様です。 <br /> <br />`;
        let h3 = `035050の [${utility.formatDate(locSA[0])} ~ ${utility.formatDate(locEA[0])}] CDR統計DATAです。よろしくお願いします。 <br /> <br /> `;
        let h5 = `※本メールはシステムより自動的に送信されています。<br /> <br />`;

        html += h4;
        html += h3;
        html += h5;

        let table = '';
        const style = `thead { text-align: left;background-color: #4CAF50; color: white; }`

        table += `<table class='some-table' border="2" style='${style}'>
             <thead>
              <tr> 
                <th>DATE</th>
                <th>GATEWAY</th>
                <th>TRUNKPORTNAME</th>
                <th>CALLCOUNT</th>
                <th>国際CALL</th>
                <th>国内CALL</th>
                <th>INBOUND</th>
                <th>OUTBOUND</th>
                <th>DURATION</th>
                <th>請求先不明</th>
             </tr> 
             </thead>
        <tbody>
        ${tableRows}    
        </tbody>
        </table>`;

        let div = `<div style="margin: auto;width: 100%;">${table}</div>`;


        html += div;
        html += "Thank you";
        // console.log("sdfsdf"+html);
    
        return html;

    } catch (err) {
        console.log("error in daily transition email batch" + err.message);
    }
    
    
}


function rowData(data) {

    

    try {

        let tableRow = '';

        let cdrcountSum = 0, kokusaiSum = 0, kokunaiSum = 0, inboundSum = 0, outboundSum = 0, durationsSum = 0, fumeichkSum = 0;

        for (let i = 0; i < data.length; i++) {
            let gateway = data[i]['gateway'];
            let trunk_port_name = (data[i]['trunk_port_name']);
            let cdrcount = utility.numberWithCommas(data[i]['cdrcount']);
            let kokusai = utility.numberWithCommas(data[i]['kokusai']);
            let kokunai = utility.numberWithCommas(data[i]['kokunai']);
            let inbound = utility.numberWithCommas(data[i]['inbound']);
            let outbound = utility.numberWithCommas(data[i]['outbound']);
            let durations = utility.numberWithCommas(data[i]['durations']);
            let fumeichk = utility.numberWithCommas(data[i]['fumeichk'])

            cdrcountSum += parseInt(data[i]['cdrcount'], 10);
            kokusaiSum += parseInt(data[i]['kokusai'], 10);
            kokunaiSum += parseInt(data[i]['kokunai'], 10);
            inboundSum += parseInt(data[i]['inbound'], 10);
            outboundSum += parseInt(data[i]['outbound'], 10);
            durationsSum += parseFloat(data[i]['durations']);
            fumeichkSum += parseInt(data[i]['fumeichk'], 10);

            tableRow += '<tr>';

            if (i == 0)
                tableRow += `<td class="day">${utility.formatDate(data[i]['day'])}</td>`;
            else
                tableRow += `<td class="day"></td>`;

            tableRow += `<td style="text-align:right" class="gateway">${gateway}</td>`;
            tableRow += `<td style="text-align:right" class="trunk_port_name">${trunk_port_name}</td>`;
            tableRow += `<td style="text-align:right" class="cdrcount">${cdrcount}</td>`;

            tableRow += `<td style="text-align:right" class="kokusai">${kokusai}</td>`;
            tableRow += `<td style="text-align:right" class="kokunai">${kokunai}</td>`;
            tableRow += `<td style="text-align:right" class="inbound">${inbound}</td>`;

            tableRow += `<td style="text-align:right" class="outbound">${outbound}</td>`;
            tableRow += `<td style="text-align:right" class="durations">${durations}</td>`;
            tableRow += `<td style="text-align:right" class="durations">${fumeichk}</td>`;
            tableRow = tableRow + '</tr>'

        }
        tableRow += `<tr style="font-weight:bold"> `

        tableRow += `<td class="day"></td>`;
        tableRow += `<td class="day"></td>`;
        tableRow += `<td class="day">小合計</td>`;
        tableRow += `<td style="text-align:right" class="cdrcount">${utility.numberWithCommas(cdrcountSum)}</td>`;

        tableRow += `<td style="text-align:right" class="kokusai">${utility.numberWithCommas(kokusaiSum)}</td>`;
        tableRow += `<td style="text-align:right" class="kokunai">${utility.numberWithCommas(kokunaiSum)}</td>`;
        tableRow += `<td style="text-align:right" class="inbound">${utility.numberWithCommas(inboundSum)}</td>`;

        tableRow += `<td style="text-align:right" class="outbound">${utility.numberWithCommas(outboundSum)}</td>`;
        tableRow += `<td style="text-align:right" class="durations">${utility.numberWithCommas(durationsSum.toFixed(1))}</td>`;
        tableRow += `<td style="text-align:right" class="durations">${utility.numberWithCommas(fumeichkSum)}</td>`;

        tableRow += '</tr>'
        

        return { tableRow, cdrcountSum, kokusaiSum, kokunaiSum, inboundSum, outboundSum, durationsSum, fumeichkSum };

    } catch (error) {
        console.log("Error in creating table row.." + error.message);
    }

}