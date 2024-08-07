const fs = require("fs");
var path = require("path");
const iconv = require("iconv-lite");

const dateVsMonths = {
  "01": "Jan",
  "02": "Feb",
  "03": "March",
  "04": "April",
  "05": "May",
  "06": "June",
  "07": "July",
  "08": "Augest",
  "09": "Sept",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const dateVsMonthsWithoutZero = {
  1: "Jan",
  2: "Feb",
  3: "March",
  4: "April",
  5: "May",
  6: "June",
  7: "July",
  8: "Augest",
  9: "Sept",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

module.exports = { dateVsMonths };
module.exports = { dateVsMonthsWithoutZero };

module.exports.getMonthName = function (monthNo) {
  if (monthNo) {
    return dateVsMonths[monthNo];
  }
  return null;
};

/*
create CSV file
*/

var nodemailer = require("nodemailer");

function writeArrayToCSV(data, fileName) {
  console.log("data.." + JSON.stringify(data));

  fs.writeFile(fileName, data, function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log("success");
    }
  });
}

// module.exports.createCSVWithWriter=async function(fileName, header, data){

//   const createCsvWriter = require('csv-writer').createObjectCsvWriter;
//   const csvWriter = createCsvWriter({ header,path: fileName});

//   csvWriter.writeRecords(data)       // returns a promise
//     .then(() => {
//         console.log('...Done');
//     });
// }

// module.exports.createCSVWithWriter=async function(fileName, header, data){

//   const createCsvWriter = require('csv-writer').createObjectCsvWriter({header, path: fileName });

//   try{
//     await writeData(data, createCsvWriter);
//   }catch(err){
//     console.log("Err=="+err.message);
//   }

// }

// async function writeData(records, csvWriter){
//   try{
//     await csvWriter.writeRecords(records)
//   }catch(erorr){
//     console.log("Error == "+error.message);
//   }
// }

module.exports.createCSVWithWriter = async function (fileName, header, data) {
  const createCsvWriter = require("csv-writer").createObjectCsvWriter({
    append: true,
    header,
    path: fileName,
  });

  try {
    await writeData(data, createCsvWriter);
  } catch (err) {
    console.log("Err==" + err.message);
  }
};

async function writeData(records, csvWriter) {
  try {
    await csvWriter.writeRecords(records);
  } catch (erorr) {
    console.log("Error== " + error.message);
  }
}

module.exports.daysInMonth = function (month, year) {
  return new Date(year, month, 0).getDate();
};

module.exports.arrayToCsv = function (data, headers, fileName) {
  let csvRows = [];
  csvRows.push(headers.join(",") + "\r\n");

  console.log("ROW LENGTH=" + csvRows.length);

  csvRows += data
    .map(function (d) {
      return JSON.stringify(Object.values(d));
    })
    .join("\n")
    .replace(/(^\[)|(\]$)/gm, "");

  //console.log(csvRows);
  writeArrayToCSV(csvRows, fileName);
};

module.exports.utcToDate = async function (utcDate) {
  let newDate = "";
  let stDate = utcDate.toISOString();
  try {
    newDate = stDate.replace(/T/, " ").replace(/\..+/, "");
  } catch (err) {
    console.log(err.message);
    newDate = stDate;
  }
  return newDate;
};

module.exports.utcToDateNew = async function (utcDate) {
  try {
    //var d = new Date("2024-01-25T12:04:00.000Z");

    let date = new Date(utcDate);

    return date.toLocaleString();

    // var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    // var offset = date.getTimezoneOffset() / 60;
    // var hours = date.getHours();

    // newDate.setHours(hours - offset);

    return newDate;
  } catch (err) {
    console.log(err.message);
  }
};

// const headers=['通話開始時間','通話開始時間','通話元番号','通話先番号','通話時間（秒）','GSX','ten'];
// const fileName='abc.csv';
// arrayToCSV(arr,headers,fileName);
/****************** send email ***************/

module.exports.sendEmailIPSPro = async function (mailOptions) {
  var transporter = nodemailer.createTransport({
    secure: false,
    host: "103.120.16.136",
    port: 587,
    auth: {
      user: "ipsp_billing@sysmail.ipspro.co.jp",
      pass: "3aThu7rlMu1oSwl*Rim6",
    },
  });

  try {
    let res = await transporter.sendMail(mailOptions);
    console.log("res.." + JSON.stringify(res));
    return res;
  } catch (error) {
    console.log("error.." + error);
    return error;
  }
};

module.exports.sendEmailTesting = async function (mailOptions) {
  var transporter = nodemailer.createTransport({
    secure: false,
    host: "103.120.16.136",
    port: 587,
    auth: {
      user: "ips_tech@sysmail.ipsism.co.jp",
      pass: "t2oqa$5sPlNix2zuT$",
    },
  });

  try {
    let res = await transporter.sendMail(mailOptions);
    console.log("res.." + JSON.stringify(res));
    return res;
  } catch (error) {
    console.log("error.." + error);
    return error;
  }
};

module.exports.sendEmail = function (mailOptions) {
  var transporter = nodemailer.createTransport({
    secure: false,
    host: "103.120.16.136",
    port: 587,
    auth: {
      user: "ips_tech@sysmail.ipsism.co.jp",
      pass: "t2oqa$5sPlNix2zuT$",
    },
  });

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
      return false;
    } else {
      console.log("Email sent: " + info.response);
      return true;
    }
  });
};

module.exports.copyCDR = function (source, target) {
  copyFolderRecursiveSync(source, target);
};

module.exports.rates = { fico: [{ mobile: "14", landLine: "6" }] };

module.exports.numberWithCommas = function (x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

function copyFolderRecursiveSync(source, target) {
  var files = [];

  //check if folder needs to be created or integrated
  var targetFolder = path.join(target, path.basename(source));
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  //copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    files.forEach(function (file) {
      var curSource = path.join(source, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  }
}

function copyFileSync(source, target) {
  var targetFile = target;

  //if target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

module.exports.createFolder = function createFolder(folderName) {
  const fs = require("fs");
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName, { recursive: true });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports.getPaymentPlanDate = async function (mode, year, month) {
  let checkIfHolidayTableExistRes = await checkIfHolidayTableExist(year);

  if (!checkIfHolidayTableExistRes) {
    await createHolidayTableAndAddHolidayRecords(year, month);
  }

  const getHolidayDataRes = await getHolidayData(year, month);
};

async function checkIfHolidayTableExist(year) {
  const chcekHolidayTable = `SELECT EXISTS ( SELECT FROM information_schema.tables WHERE  table_schema ='public' AND table_name = 'jp_holiday_${year}' )`;
  let checkTableExistRes = await db.query(chcekHolidayTable, [], true);

  if (checkTableExistRes && checkTableExistRes.rows) {
    return checkTableExistRes.rows[0]["exists"];
  } else {
    return false;
  }
}

async function createHolidayTableAndAddHolidayRecords(year, month) {
  const query = ` CREATE TABLE IF NOT EXISTS "jp_holiday_${year}" ("id" serial, "holiday_date" TIMESTAMP WITHout TIME ZONE not null , name VARCHAR ) `;
  const tableCreationRes = await db.query(query, [], true);
  const res = await getHolidayData(year);

  return res;
}

var https = require("https");

async function getHolidayData(year) {
  var connectApiHost = "holidays-jp.shogo82148.com";
  var connectApiPath = `/${year}`;

  var options = {
    host: connectApiHost,
    path: connectApiPath,
    //headers: {"Authorization": "Key " + connectApiKey},
    //port: 443,
    method: "GET",
  };

  https
    .request(options, function (res) {
      console.log("STATUS: " + res.statusCode);
      console.log("HEADERS: " + JSON.stringify(res.headers));
      res.setEncoding("utf8");
      res.on("data", function (chunk) {
        console.log("BODY: " + chunk);
      });
    })
    .end();
}

function pad(n) {
  return n < 10 ? "0" + n : n;
}

module.exports.getCurrentYearMonthDay = function (date) {
  var d;

  if (date) {
    d = new Date(date);
  } else {
    d = new Date();
  }

  let month = pad(d.getMonth() + 1);
  let day = pad(d.getDate());
  let year = d.getFullYear();

  console.log("year..." + year);
  console.log("day..." + day);
  console.log("month..." + month);

  return `${year}-${month}-${day}`;
};

function pad(n) {
  return n < 10 ? "0" + n : n;
}

module.exports.getCurrentDayMonthYear = function (date) {
  var d;

  if (date) {
    d = new Date(date);
  } else {
    d = new Date();
  }
  let month = d.getMonth() + 1;
  let day = d.getDate();
  let year = d.getFullYear();

  return `${year}_${month}_${day}`;
};

module.exports.getPreviousYearMonth = function (date) {
  var d;

  if (date) {
    d = new Date(date);
  } else {
    d = new Date();
  }

  d.setDate(1);
  d.setMonth(d.getMonth() - 1);

  let month = d.getMonth() + 1;
  let day = d.getDate();
  let year = d.getFullYear();

  if (month < 10) {
    month = "0" + month;
  }

  return { year: [year], month: [month] };
};

module.exports.getPreviousYearMonthDay = function (date) {
  var d;

  if (date) {
    d = new Date(date);
  } else {
    d = new Date();
  }

  d.setDate(1);
  d.setMonth(d.getMonth() - 1);

  let prevMonth = d.getMonth() + 1;
  let prevDay = d.getDate();
  let prevYear = d.getFullYear();

  if (prevMonth < 10) {
    prevMonth = "0" + prevMonth;
  }

  return { prevYear, prevMonth, prevDay };
};

module.exports.formatDate = function (date) {
  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("/");
};

module.exports.splitDate = function (date) {
  let year = "",
    month = "",
    monthName = "";
  const dateVsMonths = {
    "01": "Jan",
    "02": "Feb",
    "03": "March",
    "04": "April",
    "05": "May",
    "06": "June",
    "07": "July",
    "08": "Augest",
    "09": "Sept",
    10: "Oct",
    11: "Nov",
    12: "Dec",
  };
  try {
    let dateTmpArr = date.split(" ");
    let dateArr = dateTmpArr[0].split("-");
    year = dateArr[0];
    month = dateArr[1];
    monthName = dateVsMonths[month];
  } catch (e) {
    console.log(e.message);
  }
  return [monthName, year, month];
};

module.exports.genrateHTML = function (domesticAmount, intAmount, year, month) {
  return `<div class="">
  <div class="aHl"></div>
  <div id=":7jn" tabindex="-1"></div>
  <div id=":7gt" class="ii gt">
      <div id=":6nq" class="a3s aXjCH ">
          <div dir="ltr">Hi Ito-san,
              <div>Otsukare sama desu.</div>
              <div>
                  <br>
              </div>
              <div>Below are the&nbsp;<span><span class="il">JCI</span></span>&nbsp;CDR of Domestic and International.&nbsp;&nbsp;
                  <br>
              </div>
              <div>
                  <br>
              </div>
              <div><span>33324146</span>（<span>国際</span>）
                  <br><span>請求</span>金額 ：　${intAmount}円（税抜）
                  <br>
                  <br><span>33328246</span>（<span>国内</span>）
                  <br><span>請求</span>金額 ：　${domesticAmount}円（税抜）&nbsp;</div>
              <div>&nbsp;
                  <br>
              </div>
              <div>Below is the CRD path of the&nbsp;<span><span class="il">JCI</span></span>.</div>
              <div>\\\\Ws35\\<span>国内</span>通信\\通信事業部\\CDR_MVNO\\CDR_JCI\\${year}\\${year}${month}
                  <br>
              </div>
              <div>
                  <br>
              </div>
              <div>Please confirm the same.</div>
              <div>
                  <br>
              </div>
              <div>Thank you</div>
          </div>
          <div class="yj6qo"></div>
          <div class="adL">
          </div>
      </div>
  </div>
  <div id=":6ma" class="ii gt" style="display:none">
      <div id=":7f8" class="a3s aXjCH undefined"></div>
  </div>
  <div class="hi"></div>
  </div>`;
};
