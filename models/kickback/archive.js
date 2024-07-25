var db = require("./../../config/database");
const pgp = require("pg-promise")({
  capSQL: true,
});
const { BATCH_SIZE } = require("../../config/config");
const CDR_CS = "cdr_cs";
const BILLCDR_CS = "billcdr_cs";

let ColumnSetNewSonus = [
  "cdr_id",
  "gw",
  "session_id",
  "start_time",
  "stop_time",
  "callduration",
  "disconnect_reason",
  "calltype_id",
  "calling_number",
  "called_number",
  "ingr_pstn_trunk_name",
  "calling_name",
  "orig_ioi",
  "term_ioi",
  "calling_type",
  "called_type",
  "date_added",
  "duration_use",
  "sonus_duration",
  "company_code",
  "term_carrier_id",
  "orig_carrier_id",
  "cpc",
  "kickcompany"
];

let ColumnSetSonus = [
  "date_bill",
  "orig_ani",
  "term_ani",
  "start_time",
  "stop_time",
  "duration",
  "duration_use",
  "in_outbound",
  "dom_int_call",
  "orig_carrier_id",
  "term_carrier_id",
  "transit_carrier_id",
  "selected_carrier_id",
  "billing_company_code",
  "trunk_port",
  "sonus_session_id",
  "sonus_start_time",
  "sonus_disconnect_time",
  "sonus_call_duration",
  "sonus_call_duration_second",
  "sonus_anani",
  "sonus_incallednumber",
  "sonus_ingressprotocolvariant",
  "registerdate",
  "sonus_ingrpstntrunkname",
  "sonus_gw",
  "sonus_callstatus",
  "sonus_callingnumber",
  "sonus_egcallednumber",
];

let ColumnSetBillCDR = [
  "cdr_id",
  "date_bill",
  "company_code",
  "carrier_code",
  "in_outbound",
  "call_type",
  "trunk_port_target",
  "duration",
  "start_time",
  "stop_time",
  "orig_ani",
  "term_ani",
  "route_info",
  "date_update",
  "orig_carrier_id",
  "term_carrier_id",
  "transit_carrier_id",
  "selected_carrier_id",
  "trunk_port_name",
  "gw",
  "session_id",
  "call_status",
  "kick_company",
  "term_use",
];

module.exports = {
  getTargetNewCDR: async function (targetDate) {
    console.log("Here!");
    try {
      const query = `select *, CALLDURATION*0.01 AS DURATION from cdr where  start_time>='${targetDate}' and  
      start_time < DATE_ADD("${targetDate}", INTERVAL 30 DAY) and ingr_pstn_trunk_name ='INNET00'     `;
      //const query = `select * from cdr where start_time>='${targetDate}' and  start_time < DATE_ADD("${targetDate}", INTERVAL 1 DAY) ` ;

      //STARTTIME >= '${targetDateWithTimezone}' and startTime < DATE_ADD("${targetDateWithTimezone}", INTERVAL 1 DAY)
      //AND (INGRPSTNTRUNKNAME IN ('IPSFUS10NWJ','IPSKRG5A00J','IPSKRG6BIIJ','IPSSHGF59EJ','IPSSHG5423J7') )
      //AND (INGRPSTNTRUNKNAME IN ('IPSCSQFFFFJ7','IPSCSQ0000J7') )

      console.log("new get sql query=" + query);

      const data = await db.mySQLQuery(query, [], "new_data");

      //console.log("data.."+JSON.stringify(data))
      return data;
    } catch (error) {
      return error;
    }
  },
  getTargetDate: async function (date_id) {
    try {
      const query = `SELECT date_id , date_set::date + interval '1' day as next_run_time  ,  (date_set)::date + interval '0 HOURS' as target_date , (date_set)::date - interval '9 HOURS'  as target_date_with_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
      const targetDateRes = await db.query(query, []);
      // console.log(targetDateRes);
      if (targetDateRes.rows) {
        return {
          id: targetDateRes.rows[0].date_id,
          next_run_time: targetDateRes.rows[0].next_run_time,
          targetDate: targetDateRes.rows[0].target_date,
          targetDateWithTimezone:
            targetDateRes.rows[0].target_date_with_timezone,
        };
      }
      return { err: "not found" };
    } catch (error) {
      return error;
    }
  },
  getTableName: async function (targetDate, __type) {
    try {
      const year = new Date(targetDate).getFullYear();
      let month = new Date(targetDate).getMonth() + 1;

      if (parseInt(month, 10) < 10) {
        month = "0" + month;
      }

      if (__type === "billcdr") {
        return `billcdr_${year}${month}`;
      } else if (__type === "migration_data") {
        return `cdr_${year}${month}_new`;
      } else {
        return `cdr_${year}${month}`;
      }
    } catch (e) {
      console.log("err in get table=" + e.message);
      return console.error(e);
    }
  },

  checkTableExist: async function (tableName, database = "sonus_db") {
    try {
      let checkTableExistRes = false;
      const query = `SELECT EXISTS ( SELECT FROM information_schema.tables WHERE  table_schema ='public' AND table_name = '${tableName}' )`;
      if (database === "ibs") {
        checkTableExistRes = await db.queryIBS(query, []);
      } else {
        checkTableExistRes = await db.query(query, []);
      }

      if (checkTableExistRes && checkTableExistRes.rows) {
        return checkTableExistRes.rows[0]["exists"];
      }
      return checkTableExistRes;
    } catch (e) {
      console.log("err in get table=" + e.message);
      throw new Error("Error in checking table exist!!" + e.message);
    }
  },

  createTableNewMigration: async function (tableName) {
    try {
      const query = ` CREATE TABLE IF NOT EXISTS "${tableName}" (id serial, cdr_id integer, gw varchar, session_id varchar, start_time timestamp without time zone,
         stop_time timestamp without time zone, callduration varchar, disconnect_reason varchar, calltype_id varchar,
         calling_number varchar, called_number varchar, ingr_pstn_trunk_name varchar, calling_name varchar, orig_ioi varchar, 
         term_ioi varchar, calling_type varchar, called_type varchar, date_added timestamp without time zone, 
         duration_use varchar, sonus_duration varchar, company_code varchar, term_carrier_id varchar, orig_carrier_id varchar, 
         cpc varchar )`;

      const tableCreationRes = db.queryIBS(query, []);
      if (tableCreationRes) {
        return tableCreationRes;
      }

      throw new Error("Error while creating table..." + tableCreationRes);
    } catch (e) {
      throw new Error("Error while creating table..." + e.message);
    }
  },

  createTable: async function (tableName) {
    try {
      const query = ` CREATE TABLE IF NOT EXISTS "${tableName}" ("cdr_id" BIGSERIAL, "date_bill" TIMESTAMP WITHout TIME ZONE not null , orig_ani VARCHAR , term_ani VARCHAR,
      "start_time" TIMESTAMP WITHout TIME ZONE not null , "stop_time" TIMESTAMP WITHout TIME ZONE not null
       ,"duration" VARCHAR(255), "duration_use" VARCHAR(255),
       "dom_int_call" VARCHAR(255), "orig_carrier_id" VARCHAR(255),
      "selected_carrier_id" VARCHAR, "billing_company_code" VARCHAR, "trunk_port" VARCHAR, "sonus_session_id" VARCHAR,
      "sonus_start_time" TIMESTAMP WITHOUT TIME ZONE, "sonus_disconnect_time" TIMESTAMP WITHout TIME ZONE, "sonus_call_duration" VARCHAR,
      "sonus_call_duration_second" VARCHAR, "sonus_anani" VARCHAR, "sonus_incallednumber" VARCHAR, "sonus_ingressprotocolvariant" VARCHAR,
      "registerdate" TIMESTAMP WITHOUT TIME ZONE, "sonus_ingrpstntrunkname" VARCHAR, "sonus_gw" VARCHAR, "sonus_callstatus" VARCHAR,
      "sonus_callingnumber" VARCHAR, "sonus_egcallednumber" VARCHAR, "sonus_egrprotovariant" VARCHAR, "createdAt" TIMESTAMP WITHOUT TIME ZONE ,
      "updatedAt" TIMESTAMP WITHOUT TIME ZONE , in_outbound integer, term_carrier_id varchar, transit_carrier_id varchar, PRIMARY KEY ("cdr_id")) `;

      const tableCreationRes = db.query(query, []);
      if (tableCreationRes) {
        return tableCreationRes;
      }

      throw new Error("Error while creating table..." + tableCreationRes);
    } catch (e) {
      throw new Error("Error while creating table..." + e.message);
    }
  },

  createTableBillCDR: async function (tableName) {
    try {
      const query = ` CREATE TABLE IF NOT EXISTS "${tableName}" (cdr_id bigint not null, date_bill timestamp without time zone not null, 
        company_code varchar(10) not null, carrier_code varchar(6) not null, in_outbound integer not null , call_type integer  not null, 
        trunk_port_target integer not null,duration numeric not null, start_time timestamp without time zone not null, 
        stop_time timestamp without time zone not null, orig_ani varchar(30), term_ani varchar(30) not null, route_info  varchar , 
        date_update timestamp without time zone not null, orig_carrier_id varchar(10), term_carrier_id varchar(10),transit_carrier_id varchar(50), 
        selected_carrier_id varchar(10), trunk_port_name varchar(25), gw varchar(25), session_id varchar(30), call_status integer, 
        kick_company varchar(10),term_use integer ) `;

      const tableCreationRes = db.queryIBS(query, []);
      if (tableCreationRes) {
        return tableCreationRes;
      }

      throw new Error("Error while creating table..." + tableCreationRes);
    } catch (e) {
      throw new Error("Error while creating table..." + e.message);
    }
  },

  sendErrorEmail: async function (tableName, targetDate) {
    try {
      const html = `Hi, \\n
      There is something error in comsq table creating and batch control table!! \\n
      table is ${tableName} and ${targetDate} \\n
      Thank you`;
      let mailOption = {
        from: "ips_tech@sysmail.ipsism.co.jp",
        to: "uday@ipspro.co.jp",
        //  cc:'uday@ipspro.co.jp',
        subject: "Please check the comsq batch date & table!!",
        html,
      };
      utility.sendEmail(mailOption);
    } catch (e) {
      throw new Error("Error while sending email..." + e.message);
    }
  },

  deleteTargetDateCDRNewMig: async function (targetDate, tableName) {
    try {
      const query = `delete FROM ${tableName} where START_TIME::date = '${targetDate}'::date`;
      console.log("I am here!!");
      const deleteTargetDateRes = await db.queryIBS(query, []);
      console.log("I am here 1!!");
      return deleteTargetDateRes;
    } catch (error) {
      console.log("Error in deleting records " + error.message);
      return error;
    }
  },

  deleteTargetDateCDR: async function (targetDate, tableName) {
    try {
      const query = `delete FROM ${tableName} where START_TIME::date = '${targetDate}'::date`;
      console.log("I am here!!");
      const deleteTargetDateRes = await db.query(query, []);
      console.log("I am here 1!!");
      return deleteTargetDateRes;
    } catch (error) {
      console.log("Error in deleting records " + error.message);
      return error;
    }
  },

  getTargetCDR: async function (targetDateWithTimezone) {
    try {
      const query = `SELECT GW, SESSIONID, STARTTIME, CALLDURATION, ADDTIME(STARTTIME,'09:00:00') AS ORIGDATE, DISCONNECTTIME, ADDTIME(DISCONNECTTIME,'09:00:00') AS STOPTIME, 
        CALLDURATION*0.01 AS DURATION, CEIL(CALLDURATION*0.01) AS DURATIONKIRIAGE, INANI, INGRPSTNTRUNKNAME,
        OUTGOING, INCALLEDNUMBER, CALLINGPARTYCATEGORY, EGCALLEDNUMBER, INGRESSPROTOCOLVARIANT,CALLSTATUS, CALLINGNUMBER FROM COLLECTOR_73 
        where STARTTIME >= '${targetDateWithTimezone}' and startTime < DATE_ADD("${targetDateWithTimezone}", INTERVAL 1 DAY)  
        AND (GW IN ('NFPGSX4','IPSGSX5')) 
        AND (CALLDURATION > 0)
        AND RECORDTYPEID = 3 
        AND (INGRPSTNTRUNKNAME IN ('IPSFUS10NWJ','IPSKRG5A00J','IPSKRG6BIIJ','IPSSHGF59EJ','IPSSHG5423J7','INSIP21','INSIP22') )
        order by STARTTIME asc `;
      //AND (INGRPSTNTRUNKNAME IN ('IPSFUS10NWJ','IPSKRG5A00J','IPSKRG6BIIJ','IPSSHGF59EJ','IPSSHG5423J7') )
      //AND (INGRPSTNTRUNKNAME IN ('IPSCSQFFFFJ7','IPSCSQ0000J7') )

      const data = await db.mySQLQuery(query, [], "kickback");
      return data;
    } catch (error) {
      return error;
    }
  },
  deleteTargetBillableCDR: async function (targetDate, tableNameBillCDR) {
    try {
      const query = `delete FROM ${tableNameBillCDR} where START_TIME::date = '${targetDate}'::date`;
      const deleteTargetDateRes = await db.queryIBS(query, []);
      return deleteTargetDateRes;
    } catch (error) {
      return error;
    }
  },
  getTargetBillableCDR: async function (targetDate, tableName) {
    try {
      const query = `SELECT  cdr_id, date_bill, billing_company_code, orig_carrier_id, in_outbound, dom_int_call, trunk_port, duration_use,
       start_time, stop_time, orig_ani, sonus_incallednumber, sonus_ingressprotocolvariant, term_carrier_id, transit_carrier_id, 
       selected_carrier_id, sonus_ingrpstntrunkname, sonus_gw, sonus_session_id, sonus_callstatus from ${tableName} where 
       (SONUS_GW IN ('nfpgsx4','IPSGSX5'))  AND ((TERM_ANI ILIKE '035050%')
       OR (TERM_ANI ILIKE '35050%') OR (TERM_ANI ILIKE '036110%') OR (TERM_ANI ILIKE '36110%') OR (TERM_ANI ILIKE '050505%')
       OR (TERM_ANI ILIKE '50505%')) and start_time::date='${targetDate}'::date   `;

      //     console.log("query="+query);

      const targetDateRes = await db.query(query, []);

      return targetDateRes.rows;
      // console.log(targetDateRes);
    } catch (error) {
      console.log("error in get target billable cdr=" + error.message);
      return error;
    }
  },

  insertByBatches: async function (
    records,
    getCompanyCodeInfoRes,
    getRemoteControlNumberDataRes,
    carrierInfo,
    companyInfo,
    __type,
    tableName
  ) {
    const chunkArray = chunk(records, BATCH_SIZE);

    let res = [],
      ColumnSetValue;
    let resArr = [];

    console.log("chunkArray len is ..." + chunkArray.length);

    try {
      if (__type == "new_migration_data") {
        ColumnSetValue = new pgp.helpers.ColumnSet(ColumnSetNewSonus, {
          table: tableName,
        });
      } else if (__type == "raw_cdr") {
        ColumnSetValue = new pgp.helpers.ColumnSet(ColumnSetSonus, {
          table: tableName,
        });
      } else {
        ColumnSetValue = new pgp.helpers.ColumnSet(ColumnSetBillCDR, {
          table: tableName,
        });
      }

      for (let i = 0; i < chunkArray.length; i++) {
        if (__type == "new_migration_data") {
          const data = await getNextInsertBatchNew(chunkArray[i], carrierInfo, "");
          res = await db.queryBatchInsert(data, "ibs", ColumnSetValue);
        } else if (__type == "raw_cdr") {
          const data = await getNextInsertBatch(
            chunkArray[i],
            getCompanyCodeInfoRes,
            getRemoteControlNumberDataRes
          );
          res = await db.queryBatchInsert(data, "sonus", ColumnSetValue);
        } else if (__type == "bill_cdr") {
          const data = await getNextInsertBatchBillCDR(
            chunkArray[i],
            carrierInfo,
            companyInfo
          );
          res = await db.queryBatchInsert(data, "ibs", ColumnSetValue);
        }
        resArr.push(res);
      }
      console.log("done" + new Date());
      console.log(resArr);
      return resArr;
    } catch (err) {
      console.log("Error..." + err.message);
    }
  },
  updateBatchControl: async function (serviceId, targetDate, api) {
    let query;
    try {
      if (api) {
        query = `update batch_date_control set date_set='${targetDate}'::date + interval '0' day , last_update=now() where date_id='${serviceId}'`;
      } else {
        query = `update batch_date_control set date_set='${targetDate}'::date + interval '1' day , last_update=now() where date_id='${serviceId}'`;
      }

      const updateBatchControlRes = await db.query(query, []);
      return updateBatchControlRes;
    } catch (error) {
      return error;
    }
  },
  deleteTargetDateSummary: async function (serviceId, targetDate) {
    try {
      const query = `delete FROM sonus_outbound_summary where summary_date::date = '${targetDate}'::date + interval '1' day and service_id='${serviceId}'`;
      const deleteTargetDateSummaryRes = await db.query(query, []);
      return deleteTargetDateSummaryRes;
    } catch (error) {
      return error;
    }
  },
  getProSummaryData: async function (targetDate) {
    try {
      const query = `select count(*) as total FROM cdr_sonus where START_TIME >= '${targetDate}' and start_Time < '${targetDate}'::timestamp + INTERVAL '1' DAY`;
      const getProSummaryDataRes = await db.query(query, []);
      return getProSummaryDataRes.rows;
    } catch (error) {
      return error;
    }
  },
  getStatus: async function (targetDate) {
    try {
      const query = `select count(*) as total FROM cdr_sonus where START_TIME >= '${targetDate}' and start_Time < '${targetDate}'::timestamp + INTERVAL '1' DAY`;
      const getProSummaryDataRes = await db.query(query, []);
      return getProSummaryDataRes.rows;
    } catch (error) {
      return error;
    }
  },
  updateSummaryData: async function (
    serviceId,
    targetDateWithTimezone,
    sonusData,
    billingServerData
  ) {
    try {
      const query = `insert into sonus_outbound_summary (service_id, raw_cdr_cound, pro_cdr_count, summary_date, date_updated) 
        VALUES ($1, $2, $3, $4, $5) returning cdr_id`;

      let valueArray = [];
      valueArray.push(serviceId);
      valueArray.push(parseInt(sonusData.length));
      valueArray.push(parseInt(billingServerData[0]["total"]));
      valueArray.push(targetDateWithTimezone);
      valueArray.push(now());

      const updateSummaryDataRes = await db.query(query, valueArray);
      return updateSummaryDataRes;
    } catch (error) {
      return error;
    }
  },
  getRemoteControlNumberData: async function (DATSTARTTIME) {
    try {
      const query = `select company_code, tel_no from remote_control_number  where DATE_EXPIRED >= '${DATSTARTTIME}' `;
      const getRemoteControlNumberRes = await db.queryIBS(query, []);
      return getRemoteControlNumberRes.rows;
    } catch (error) {
      console.log(
        "error in get remote control number info query" + error.message
      );
      return error;
    }
  },

  getCompanyCodeInfo: async function (DATSTARTTIME) {
    try {
      const query = `select * from route where DATE_EXPIRED >= '${DATSTARTTIME}' and deleted = false `;
      const getCompanyCodeInfoRes = await db.queryIBS(query, []);
      if (getCompanyCodeInfoRes.rows) {
        return getCompanyCodeInfoRes.rows;
      }
    } catch (error) {
      console.log("error in get company info query" + error.message);
      return error;
    }
  },
  getKickCompanyInfo: async function () {
    try {
      const query = `select substring(_03_numbers, 2, 10) as _03_numbers, customer_cd from _03numbers  `;
      const getKickCompanyInfoRes = await db.queryIBS(query, []);
      if (getKickCompanyInfoRes.rows) {
        return getKickCompanyInfoRes.rows;
      }
    } catch (error) {
      console.log("error in get company info query" + error.message);
      return error;
    }
  },
  getTerminalUseInfo: async function (DATSTARTTIME) {
    try {
      const query = `select carrier_code, term_use from carrier `;
      const getTerminalUseInfoRes = await db.queryIBS(query, []);
      if (getTerminalUseInfoRes.rows) {
        return getTerminalUseInfoRes.rows;
      }
    } catch (error) {
      console.log("error in get terminal use info query" + error.message);
      return error;
    }
  },
};

function utcToDate(utcDate) {
  let newDate = "";
  let stDate = utcDate.toISOString();

  try {
    newDate = stDate.replace(/T/, " ").replace(/\..+/, "");
  } catch (err) {
    console.log(err.message);
    newDate = stDate;
  }
  return newDate;
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return utcToDate(result);
}

async function getCompanyCode(
  STRXFB,
  STRXFC,
  STRXFD,
  STRXFE,
  DATSTARTTIME,
  STRTELCALL,
  getCompanyCodeInfoRes,
  getRemoteControlNumberDataRes
) {
  let companyCode = "9999999999";

  // originated carrier Id STRXFB
  // terminated carrier id STRXFC
  // selected carrier Id STRXFD

  let companyCodeInfoArr = getCompanyCodeInfoRes;

  try {
    for (let i = 0; i < companyCodeInfoArr.length; i++) {
      if (
        companyCodeInfoArr[i]["carrier_code"] == STRXFB &&
        companyCodeInfoArr[i]["relay_code"] == ""
      ) {
        if (companyCodeInfoArr[i]["pattern"] == "1") {
          let compCode = await getCompanyCodePattern_1(
            companyCodeInfoArr,
            STRXFB,
            STRXFC
          );
          if (compCode) {
            return compCode;
          } else {
            return companyCode;
          }
        } else if (companyCodeInfoArr[i]["pattern"] == "2") {
          let compCode = await getCompanyCodePattern_2(
            companyCodeInfoArr,
            STRXFB,
            STRXFC
          );
          if (compCode) {
            return compCode;
          } else if (STRXFD == "" || STRXFD == null) {
            return companyCodeInfoArr[i]["company_code1"].replace(" ", "");
          } else {
            return await getCompanyCodeOnRelayCode(
              companyCodeInfoArr,
              STRXFD,
              STRXFB,
              companyCodeInfoArr[i]["pattern"],
              companyCodeInfoArr[i]["company_code1"]
            );
          }
        } else if (companyCodeInfoArr[i]["pattern"] == "3") {
          return await getCompanyCodeOnRelayCode(
            companyCodeInfoArr,
            STRXFD,
            STRXFB,
            companyCodeInfoArr[i]["pattern"],
            companyCodeInfoArr[i]["company_code1"]
          );
        } else if (companyCodeInfoArr[i]["pattern"] == "4") {
          for (let i = 0; i < getRemoteControlNumberDataRes.length; i++) {
            if (getRemoteControlNumberDataRes[i]["tel_no"] == STRTELCALL) {
              return getRemoteControlNumberDataRes[i]["company_code"].replace(
                " ",
                ""
              );
            }
          }
          return "PATTERN4NG";
        }
      }
    }
  } catch (err) {
    console.log("error in get company code=" + err.message);
  }

  return companyCode;
}

async function getCompanyCodeOnRelayCode(
  data,
  relayCode,
  carrierCode,
  pattern,
  company_code1
) {
  try {
    if (pattern == "2") {
      for (let i = 0; data.length; i++) {
        if (
          data[i]["carrier_code"] === carrierCode &&
          data[i]["relay_code"] === relayCode
        ) {
          return data[i]["company_code1"].replace(" ", "");
        }
      }
      return "PATTERN2NG";
    } else if (pattern == "3") {
      // console.log("in pattern 3"+relayCode, carrierCode);
      for (let i = 0; data.length; i++) {
        if (
          data[i]["carrier_code"] == carrierCode &&
          data[i]["relay_code"] == relayCode
        ) {
          for (let j = 0; j < data.length; j++) {
            if (
              data[j]["carrier_code"] == carrierCode &&
              data[j]["relay_carrier"] == relayCode
            ) {
              if (
                data[j]["company_code2"] == "" ||
                data[j]["company_code2"] == null ||
                data[j]["company_code2"] == undefined
              ) {
                return company_code1.replace(" ", "");
              } else {
                return data[j]["company_code2"].replace(" ", "");
              }
            } else {
              return data[i]["company_code1"].replace(" ", "");
            }
          }
        }
      }
      for (let i = 0; i < data.length; i++) {
        if (
          data[i]["carrier_code"] == carrierCode &&
          data[i]["relay_carrier"] == relayCode
        ) {
          if (
            data[i]["company_code2"] == "" ||
            data[i]["company_code2"] == null ||
            data[i]["company_code2"] == undefined
          ) {
            return company_code1.replace(" ", "");
          } else {
            return data[i]["company_code2"].replace(" ", "");
          }
        } else {
          return company_code1.replace(" ", "");
        }
      }
    }
  } catch (err) {
    console.log(
      "error in get comapny code in side relay function=" + err.message
    );
  }
  return "9999999999";
}

async function getCompanyCodePattern_1(data, carrierCode, term_carrier_id) {
  let tmpObj = data.filter((obj) => {
    if (obj["carrier_code"] == carrierCode) return true;
  });

  for (let i = 0; i < tmpObj.length; i++) {
    if (tmpObj[i]["term_carrier_id"] == term_carrier_id) {
      return tmpObj[i]["company_code1"].replace(" ", "");
    }
  }
  for (let i = 0; i < tmpObj.length; i++) {
    if (
      tmpObj[i]["term_carrier_id"] == "" ||
      tmpObj[i]["term_carrier_id"] == null ||
      tmpObj[i]["term_carrier_id"] == "null"
    ) {
      return tmpObj[i]["company_code1"].replace(" ", "");
    }
  }
  return null;
}

async function getCompanyCodePattern_2(data, carrierCode, term_carrier_id) {
  let tmpObj = data.filter((obj) => {
    if (obj["carrier_code"] == carrierCode) return true;
  });

  for (let i = 0; i < tmpObj.length; i++) {
    if (tmpObj[i]["term_carrier_id"] == term_carrier_id) {
      return tmpObj[i]["company_code1"].replace(" ", "");
    }
  }
  return null;
}

async function getNextInsertBatch(
  data,
  getCompanyCodeInfoRes,
  getRemoteControlNumberDataRes
) {
  const dataLen = data.length;
  console.log("data preapering for ");
  let valueArray = [];

  try {
    for (let i = 0; i < dataLen; i++) {
      let INCALLEDNUMBER = data[i]["INCALLEDNUMBER"];

      if (data[i]["INCALLEDNUMBER"].substring(0, 4) == "4266") {
        INCALLEDNUMBER = data[i]["INCALLEDNUMBER"].substring(4);
      }

      const { TRUNKPORT, XFB, XFC, XFD, XFE, XFEF, XFEL, INOU, INDO, XFEC } =
        await getInOutbound(
          data[i]["INGRESSPROTOCOLVARIANT"],
          data[i]["INGRPSTNTRUNKNAME"]
        );
      const companyCode = await getCompanyCode(
        XFB,
        XFC,
        XFD,
        XFE,
        data[i]["ORIGDATE"],
        INCALLEDNUMBER,
        getCompanyCodeInfoRes,
        getRemoteControlNumberDataRes
      );

      let obj = {};
      obj["date_bill"] = data[i]["ORIGDATE"];
      obj["orig_ani"] = data[i]["INANI"];
      obj["term_ani"] = INCALLEDNUMBER;
      obj["stop_time"] = data[i]["STOPTIME"];
      obj["start_time"] = data[i]["ORIGDATE"];
      obj["duration"] = parseFloat(data[i]["DURATION"]);
      obj["duration_use"] = await getDurationUse(data[i]["DURATION"]);
      obj["in_outbound"] = INOU;
      obj["dom_int_call"] = INDO;
      obj["orig_carrier_id"] = XFB;
      obj["term_carrier_id"] = XFC;
      obj["transit_carrier_id"] = XFE;
      obj["selected_carrier_id"] = XFD;
      obj["billing_company_code"] = companyCode;
      obj["trunk_port"] = TRUNKPORT;
      obj["sonus_session_id"] = data[i]["SESSIONID"];
      obj["sonus_start_time"] = data[i]["STARTTIME"];
      obj["sonus_disconnect_time"] = data[i]["DISCONNECTTIME"];
      obj["sonus_call_duration"] = data[i]["CALLDURATION"];
      obj["sonus_call_duration_second"] = parseInt(data[i]["DURATION"], 10);
      obj["sonus_anani"] = data[i]["INANI"];
      obj["sonus_incallednumber"] = INCALLEDNUMBER;
      obj["sonus_ingressprotocolvariant"] = data[i]["INGRESSPROTOCOLVARIANT"];
      obj["registerdate"] = "now()";
      obj["sonus_ingrpstntrunkname"] = data[i]["INGRPSTNTRUNKNAME"];
      obj["sonus_gw"] = data[i]["GW"];
      obj["sonus_callstatus"] = data[i]["CALLSTATUS"];
      obj["sonus_callingnumber"] = data[i]["CALLINGNUMBER"];
      obj["sonus_egcallednumber"] = data[i]["EGCALLEDNUMBER"];

      valueArray.push(obj);
    }
  } catch (err) {
    console.log("err in data preapring==" + err.message);
  }
  console.log("arr length=" + valueArray.length);
  return valueArray;
}

async function getNextInsertBatchNew(data, companyInfo) {
  const dataLen = data.length;
  console.log("data preapering for new sonus data ");
  let valueArray = [];

  // ['cdr_id', 'gw', 'session_id', 'start_time', 'stop_time', 'callduration', 'disconnect_reason', 'calltype_id','calling_number',
  //'called_number', 'ingr_pstn_trunk_name', 'calling_name', 'orig_ioi', 'term_ioi', 'calling_type','called_type', 'date_added'];

  try {
    for (let i = 0; i < dataLen; i++) {
      // let INCALLEDNUMBER = data[i]['INCALLEDNUMBER'] ;

      // if(data[i]['INCALLEDNUMBER'].substring(0,4) == '4266'){
      //   INCALLEDNUMBER = data[i]['INCALLEDNUMBER'].substring(4);
      // }

      // const { TRUNKPORT, XFB, XFC, XFD, XFE, XFEF, XFEL, INOU, INDO, XFEC } = await getInOutbound(data[i]['INGRESSPROTOCOLVARIANT'], data[i]['INGRPSTNTRUNKNAME']);
      // const companyCode = await getCompanyCode(XFB, XFC, XFD, XFE, data[i]['ORIGDATE'], INCALLEDNUMBER, getCompanyCodeInfoRes, getRemoteControlNumberDataRes);

      //console.log("data[i]['START_TIME'] len ..."+ data[i]['START_TIME'].toString().length )

      if (data[i]["START_TIME"].toString().length != 55) {
        console.log("data[i]['START_TIME'] len ..." + data[i]["START_TIME"]);
      }

      if (data[i]["DISCONNECT_TIME"].toString().length != 55) {
        console.log(
          "data[i]['DISCONNECT_TIME'] len ..." + data[i]["DISCONNECT_TIME"]
        );
        console.log("data[i]['START_TIME']" + data[i]["START_TIME"]);
      }

      const { companyCode, origCarrierId } = await getCompanyCodeNew(
        data[i]["ORIG_IOI"]
      );
      const termCarrierId = await getTermCarrierId(data[i]["CALLED_NUMBER"]);

      let obj = {};
      obj["cdr_id"] = data[i]["ID"];
      obj["gw"] = data[i]["GW"];
      obj["session_id"] = data[i]["SESSION_ID"];
      obj["stop_time"] = data[i]["DISCONNECT_TIME"];
      obj["start_time"] = data[i]["START_TIME"];
      obj["callduration"] = parseFloat(data[i]["DURATION"]);
      obj["duration_use"] = await getDurationUse(data[i]["DURATION"]);
      obj["sonus_duration"] = parseFloat(data[i]["CALLDURATION"]);
      obj["disconnect_reason"] = data[i]["DISCONNECT_REASON"];
      obj["calltype_id"] = data[i]["CALL_TYPE_ID"];
      obj["calling_number"] = data[i]["CALLING_NUMBER"];
      obj["called_number"] = data[i]["CALLED_NUMBER"];
      obj["ingr_pstn_trunk_name"] = data[i]["INGR_PSTN_TRUNK_NAME"];
      obj["calling_name"] = data[i]["CALLING_NAME"];
      obj["orig_ioi"] = data[i]["ORIG_IOI"];
      obj["term_ioi"] = data[i]["TERM_IOI"];
      obj["calling_type"] = data[i]["CALLING_TYPE"];
      obj["called_type"] = data[i]["CALLED_TYPE"];
      obj["company_code"] = companyCode;
      obj["term_carrier_id"] = termCarrierId;
      obj["orig_carrier_id"] = origCarrierId;
      obj["date_added"] = "now()";
      obj["cpc"] = data[i]["CPC"];
      obj["kickcompany"] = await getKickCompany( data[i]["CALLED_NUMBER"],
      companyInfo)

      // obj['sonus_anani'] = data[i]['INANI'];
      // obj['sonus_incallednumber'] = INCALLEDNUMBER;
      // obj['sonus_ingressprotocolvariant'] = data[i]['CALLED_TYPE'];
      // obj['registerdate'] = 'now()';
      // obj['sonus_ingrpstntrunkname'] = data[i]['INGRPSTNTRUNKNAME'];
      // obj['sonus_gw'] = data[i]['GW'];
      // obj['sonus_callstatus'] = data[i]['CALLSTATUS'];
      // obj['sonus_callingnumber'] = data[i]['CALLINGNUMBER'];
      // obj['sonus_egcallednumber'] = data[i]['EGCALLEDNUMBER'];

      valueArray.push(obj);
    }
  } catch (err) {
    console.log("err in data preapring==" + err.message);
  }
  console.log("arr length=" + valueArray.length);
  return valueArray;
}

async function getCompanyCodeNew(origIOI) {
  let companyCode = "9999999999",
    origCarrierId = "";

  if (origIOI.includes("ntt-east")) {
    companyCode = "1011000056";
    if (origIOI.includes("GSTN")) {
      origCarrierId = "2233";
    } else if (origIOI.includes("IEEE")) {
      origCarrierId = "5001";
    }
  } else if (origIOI.includes("ntt-west")) {
    companyCode = "1011000057";
    if (origIOI.includes("GSTN")) {
      origCarrierId = "2234";
    } else if (origIOI.includes("IEEE")) {
      origCarrierId = "5007";
    }
  } else if (origIOI.includes("softbank")) {
    companyCode = "1011000058";
    origCarrierId = "2013";
  } else if (origIOI.includes("ntt.com")) {
    companyCode = "1011000059";
    origCarrierId = "5020";
  } else if (origIOI.includes("sanntsu.com")) {
    companyCode = "1011000060";
    origCarrierId = "6010";
  } else if (origIOI.includes("stnet.ne.jp")) {
    companyCode = "1011000061";
    origCarrierId = "5016";
  } else if (origIOI.includes("ziptelecom.tel")) {
    companyCode = "1011000062";

    if (origIOI.includes("IP-Phone")) {
      origCarrierId = "5023";
    } else if (origIOI.includes("IEEE")) {
      origCarrierId = "5041";
    }
  } else if (origIOI.includes("colt.ne.jp")) {
    companyCode = "1011000063";

    if (origIOI.includes("IP-Phone")) {
      origCarrierId = "5043";
    } else if (origIOI.includes("IEEE")) {
      origCarrierId = "5036";
    } else if (origIOI.includes("GSTN")) {
      origCarrierId = "2214";
    }
  } else if (origIOI.includes("comsq.jp")) {
    companyCode = "1011000064";
    origCarrierId = "6015";
  } else if (
    origIOI.includes("mnc051.mcc440.3gppnetwork.org") ||
    origIOI.includes("fixed.kddi.ne.jp")
  ) {
    companyCode = "1011000065";

    if (origIOI.includes("IP-Phone")) {
      origCarrierId = "5003";
    } else if (origIOI.includes("IEEE")) {
      origCarrierId = "5006";
    } else {
      companyCode = "1011000074";
      origCarrierId = "0500";
    }
  } else if (origIOI.includes("histd.jp")) {
    companyCode = "1011000066";
    origCarrierId = "6019";
  } else if (origIOI.includes("nni.0038.net")) {
    companyCode = "1011000067";

    if (origIOI.includes("IP-Phone")) {
      origCarrierId = "5012";
    } else if (origIOI.includes("IEEE")) {
      origCarrierId = "5017";
    }
  } else if (origIOI.includes("arteria-net.com")) {
    companyCode = "1011000068";

    if (origIOI.includes("IP-Phone")) {
      origCarrierId = "2276";
    } else if (origIOI.includes("IEEE")) {
      origCarrierId = "2276";
    }
  } else if (origIOI.includes("ims.mnc011.mcc440.3gppnetwork.org")) {
    companyCode = "1011000069";
    origCarrierId = "0201";
  } else if (origIOI.includes("voip.oedotele.com")) {
    companyCode = "1011000070";

    if (origIOI.includes("IP-Phone")) {
      origCarrierId = "6016";
    } else if (origIOI.includes("IEEE")) {
      origCarrierId = "6016";
    }
  } else if (origIOI.includes("ims.mnc020.mcc440.3gppnetwork.org")) {
    companyCode = "1011000071";

    origCarrierId = "0901";
  }else if (origIOI.includes("tohknet-voip.jp")) {
    companyCode = "1011000072";

    if (origIOI.includes("IP-Phone")) {
      origCarrierId = "5011";
    } else if (origIOI.includes("IEEE")) {
      origCarrierId = "5011";
    }
  }else if (origIOI.includes("eonet.ne.jp")) {
    companyCode = "1011000073";

    if (origIOI.includes("IP-Phone")) {
      origCarrierId = "5005";
    } else if (origIOI.includes("IEEE")) {
      origCarrierId = "5015";
    }
  }

  return { companyCode, origCarrierId };
}

async function getTermCarrierId(calledNumber) {
  let res = "NA",
    len = calledNumber.length;

  if (len === 11) {
    let subStr = calledNumber.substring(2, 3);

    if (subStr == "3") {
      res = "5039";
    } else if (subStr == "5") {
      res = "5040";
    }
  } else {
    let subStr = calledNumber.substring(0, 1);

    if (subStr == "3") {
      res = "5039";
    } else if (subStr == "5") {
      res = "5040";
    }
  }

  return res;
}

async function getNextInsertBatchBillCDR(data, companyInfo, carrierInfo) {
  console.log("data preapering for bill cdr");
  let valueArray = [];

  try {
    for (let i = 0; i < data.length; i++) {
      let obj = {};
      obj["cdr_id"] = data[i]["cdr_id"];
      obj["date_bill"] = data[i]["date_bill"];
      obj["company_code"] = data[i]["billing_company_code"];
      obj["carrier_code"] = data[i]["orig_carrier_id"];
      obj["in_outbound"] = data[i]["in_outbound"];
      obj["call_type"] = data[i]["dom_int_call"];
      obj["trunk_port_target"] = data[i]["trunk_port"];
      obj["duration"] = data[i]["duration_use"];
      obj["start_time"] = data[i]["start_time"];
      obj["stop_time"] = data[i]["stop_time"];
      obj["orig_ani"] = data[i]["orig_ani"];
      obj["term_ani"] = data[i]["sonus_incallednumber"];
      obj["route_info"] = data[i]["sonus_ingressprotocolvariant"];
      obj["date_update"] = "now()";
      obj["orig_carrier_id"] = data[i]["orig_carrier_id"];
      obj["term_carrier_id"] = data[i]["term_carrier_id"];
      obj["transit_carrier_id"] = data[i]["transit_carrier_id"];
      obj["selected_carrier_id"] = data[i]["selected_carrier_id"];
      obj["trunk_port_name"] = data[i]["sonus_ingrpstntrunkname"];
      obj["gw"] = data[i]["sonus_gw"];
      obj["session_id"] = data[i]["sonus_session_id"];
      obj["call_status"] = data[i]["sonus_callstatus"];
      obj["kick_company"] = await getKickCompany(
        data[i]["sonus_incallednumber"],
        companyInfo
      );
      obj["term_use"] = await getTerminalUse(
        data[i]["orig_carrier_id"],
        carrierInfo
      );

      valueArray.push(obj);
    }
  } catch (err) {
    console.log("err" + err.message);
  }
  //console.log("arr="+JSON.stringify(valueArray));
  return valueArray;
}

async function getTerminalUse(strOrigANI, carrierInfo) {
  for (let i = 0; i < carrierInfo.length; i++) {
    if (carrierInfo[i]["carrier_code"] == strOrigANI) {
      return carrierInfo[i]["term_use"];
    }
  }
  return "0";
}

async function getKickCompany(calledNumber, companyInfo) {
  for (let i = 0; i < companyInfo.length; i++) {
    if (companyInfo[i]["_03_numbers"] == calledNumber) {
      return companyInfo[i]["customer_cd"];
    }
  }
  return "88888888";
}

function chunk(array, size) {
  console.log("chunk" + size);

  const chunked_arr = [];
  let copied = [...array]; // ES6 destructuring
  const numOfChild = Math.ceil(copied.length / size); // Round up to the nearest integer
  for (let i = 0; i < numOfChild; i++) {
    chunked_arr.push(copied.splice(0, size));
  }
  return chunked_arr;
}

async function getDurationUse(duration) {
  let durationArr = duration.toString().split(".");
  if (durationArr[1]) {
    if (durationArr[1].length == 1) {
      return durationArr[0] + "." + durationArr[1];
    }
  }
  let tmp = parseInt(durationArr[1]);

  let decimalVal = 0;
  decimalVal = Math.round(tmp / 10);

  if (isNaN(decimalVal)) {
    decimalVal = 0;
  }

  let durationUse = 0;
  if (decimalVal > 9) {
    durationUse = parseInt(durationArr[0], 10) + 1;
  } else {
    durationUse = durationArr[0] + "." + decimalVal;
  }
  return durationUse;
}

async function getInOutbound(INGRESSPROTOCOLVARIANT, INGRPSTNTRUNKNAME) {
  //"JAPAN,0,0,,,,,,,,,32000,,,1,0,,,,,,,,1,,,0xfc,5039,,,,,,,,,,,,,,,,,,,,,,,,,,,,32000,0x03,,,,2,0,,,0,,,0x3
  //,,,,,,,,,,,,,,,,,,,,,,,,,,,,,3,0,0,,,,0,1,,,4,,,,,,,,,,,,,,,0,0,,,32000,32000,,,,,,1-1,1-0,,,,,,,,,,,,,,,,,
  //,,,,,,,1,0xfe,2233,32000,0x22,1,0xfe,2013,47600,,1,0xfb,2030,,,,,,,,,,"XFC
  let XFB = "",
    XFC = "",
    XFD = "",
    XFE = "",
    XFEF = "",
    XFEL = "",
    INOU = 0,
    INDO = 0,
    XFEC = 0,
    TRUNKPORT = 0;

  //return { TRUNKPORT, XFB, XFC, XFD, XFE, XFEF, XFEL, INOU, INDO, XFEC };

  if (INGRESSPROTOCOLVARIANT) {
    //XFB
    let XFBIndex = INGRESSPROTOCOLVARIANT.indexOf("0xfb");

    // console.log("XFBIndex=" + XFBIndex);

    if (XFBIndex != -1) {
      XFB = INGRESSPROTOCOLVARIANT.substring(XFBIndex + 5, XFBIndex + 9);
    }
    //XFC
    let XFCIndex = INGRESSPROTOCOLVARIANT.indexOf("0xfc");
    if (XFCIndex != -1) {
      XFC = INGRESSPROTOCOLVARIANT.substring(XFCIndex + 5, XFCIndex + 9);
    }
    //XFD
    let XFDIndex = INGRESSPROTOCOLVARIANT.indexOf("0xfd");
    if (XFDIndex != -1) {
      XFD = INGRESSPROTOCOLVARIANT.substring(XFDIndex + 5, XFDIndex + 9);
    }

    //1個目の0XFEデータがあるかどうかを確認, 0xfe
    let XFEIndex = INGRESSPROTOCOLVARIANT.indexOf("0xfe");
    //console.log("XFEIndex=" + XFEIndex);

    if (XFEIndex != -1) {
      XFE = INGRESSPROTOCOLVARIANT.substring(XFEIndex + 5, XFEIndex + 9);
      //set the first carrier id
      XFEF = INGRESSPROTOCOLVARIANT.substring(XFEIndex + 5, XFEIndex + 9);
      // set the last carrier id
      XFEL = INGRESSPROTOCOLVARIANT.substring(XFEIndex + 5, XFEIndex + 9);

      //Check if there is a second 0XFE data

      let XFEIndex1 = INGRESSPROTOCOLVARIANT.indexOf("0xfe", XFEIndex + 5);

      // console.log("XFEIndex1=" + XFEIndex1);

      if (XFEIndex1 != -1) {
        XFE =
          XFE +
          ":" +
          INGRESSPROTOCOLVARIANT.substring(XFEIndex1 + 5, XFEIndex1 + 9);
        // set the last carrier id
        XFEL = INGRESSPROTOCOLVARIANT.substring(XFEIndex1 + 5, XFEIndex1 + 9);

        //Check if there is a third 0XFE data

        let XFEIndex2 = INGRESSPROTOCOLVARIANT.indexOf("0xfe", XFEIndex1 + 5);
        // console.log("XFEIndex2=" + XFEIndex2);

        if (XFEIndex2 != -1) {
          XFE =
            XFE +
            ":" +
            INGRESSPROTOCOLVARIANT.substring(XFEIndex2 + 5, XFEIndex2 + 9);
          // set the last carrier id
          XFEL = INGRESSPROTOCOLVARIANT.substring(XFEIndex2 + 5, XFEIndex2 + 9);

          //Check if there is a fourth 0XFE data

          let XFEIndex3 = INGRESSPROTOCOLVARIANT.indexOf("0xfe", XFEIndex2 + 5);
          if (XFEIndex3 != -1) {
            XFE =
              XFE +
              ":" +
              INGRESSPROTOCOLVARIANT.substring(XFEIndex3 + 5, XFEIndex3 + 9);
            // set the last carrier id
            XFEL = INGRESSPROTOCOLVARIANT.substring(
              XFEIndex3 + 5,
              XFEIndex3 + 9
            );

            //Check if there is a fifth 0XFE data

            let XFEIndex4 = INGRESSPROTOCOLVARIANT.indexOf(
              "0xfe",
              XFEIndex3 + 5
            );
            if (XFEIndex4 != -1) {
              XFE =
                XFE +
                ":" +
                INGRESSPROTOCOLVARIANT.substring(XFEIndex4 + 5, XFEIndex4 + 9);
              // set the last carrier id
              XFEL = INGRESSPROTOCOLVARIANT.substring(
                XFEIndex4 + 5,
                XFEIndex4 + 9
              );
            }
          }
        }
      }
    }

    if (XFC === "5039" || XFC === "5040" || XFC === "2204") {
      INOU = 1;
      if (XFC === "2204") {
        INDO = 1;
      } else if (XFC === "5039") {
        INDO = 0;
      } else if (XFC == "5040") {
        INDO = 0;
      }
    } else if (XFB === "5039" || XFB === "5040" || XFB === "2204") {
      INOU = 0;
      if (XFB === "2204") {
        INDO = 1;
      } else if (XFB === "5039") {
        INDO = 0;
      } else if (XFB == "5040") {
        INDO = 0;
      }
    }

    if (XFEF === "2233" || XFC === "5039" || XFC === "5040") {
      TRUNKPORT = 1;
    } else if (XFEL === "2233" || XFB === "5039" || XFB === "5040") {
      TRUNKPORT = 1;
    } else {
      TRUNKPORT = 0;
    }

    if (
      INGRPSTNTRUNKNAME.substring(0, 11) === "IPSSHGC26BJ" ||
      INGRPSTNTRUNKNAME.substring(0, 11) === "IPSSHGD37CJ" ||
      INGRPSTNTRUNKNAME.substring(0, 11) === "IPSSHGF59EJ" ||
      INGRPSTNTRUNKNAME.substring(0, 11) === "IPSSHGE48DJ"
    ) {
      TRUNKPORT = 1;
    }
  }

  return { TRUNKPORT, XFB, XFC, XFD, XFE, XFEF, XFEL, INOU, INDO, XFEC };
}
