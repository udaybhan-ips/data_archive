const fs=require('fs');
var path = require('path');









/*
create CSV file
*/

var nodemailer = require('nodemailer');

let arr=[ { StartTime: '2019-08-01T00:50:28.000Z',
    StopTime: '2019-08-01T00:50:36.000Z',
    OrigANI: '9099249661',
    TermANI: '0032069062',
    rate: 8,
    GSX: 'nfpgsx4',
    ten: '10' },
  { StartTime: '2019-08-01T00:50:45.000Z',
    StopTime: '2019-08-01T00:50:53.000Z',
    OrigANI: '9099249661',
    TermANI: '0032069062',
    rate: 8,
    GSX: 'nfpgsx4',
    ten: '10' },
  { StartTime: '2019-08-01T00:50:57.000Z',
    StopTime: '2019-08-01T00:51:05.000Z',
    OrigANI: '9099249661',
    TermANI: '0032069062',
    rate: 8,
    GSX: 'nfpgsx4',
    ten: '10' },
  { StartTime: '2019-08-01T00:56:05.000Z',
    StopTime: '2019-08-01T00:56:14.000Z',
    OrigANI: '9099249661',
    TermANI: '0032069062',
    rate: 9,
    GSX: 'nfpgsx4',
    ten: '10' },
  { StartTime: '2019-08-01T01:01:10.000Z',
    StopTime: '2019-08-01T01:01:18.000Z',
    OrigANI: '9099249661',
    TermANI: '0032069062',
    rate: 8,
    GSX: 'nfpgsx4',
    ten: '10' },
  { StartTime: '2019-08-01T02:19:52.000Z',
    StopTime: '2019-08-01T02:20:01.000Z',
    OrigANI: '8051413502',
    TermANI: '0032069062',
    rate: 9,
    GSX: 'nfpgsx4',
    ten: '10' },
  { StartTime: '2019-08-01T03:28:20.000Z',
    StopTime: '2019-08-01T03:28:40.000Z',
    OrigANI: '8013051576',
    TermANI: '0032074510',
    rate: 20,
    GSX: 'nfpgsx4',
    ten: '10' },
  { StartTime: '2019-08-01T04:35:47.000Z',
    StopTime: '2019-08-01T04:35:55.000Z',
    OrigANI: '8094658814',
    TermANI: '0032069487',
    rate: 8,
    GSX: 'nfpgsx4',
    ten: '10' },
  { StartTime: '2019-08-01T04:36:21.000Z',
    StopTime: '2019-08-01T04:36:29.000Z',
    OrigANI: '9019966208',
    TermANI: '0032069487',
    rate: 8,
    GSX: 'nfpgsx4',
    ten: '10' },
  { StartTime: '2019-08-01T04:36:47.000Z',
    StopTime: '2019-08-01T04:36:55.000Z',
    OrigANI: '9041753190',
    TermANI: '0032069487',
    rate: 8,
    GSX: 'nfpgsx4',
    ten: '10' } ]


function writeArrayToCSV(data,fileName){
    fs.writeFile(fileName, '\ufeff' + data, { encoding: 'utf-8' }, function(err) {
      if(err){
        console.log(err);
      }else{
        console.log("success");
      }
 })
}

module.exports.createCSVWithWriter=async function(fileName, header, data){

  const createCsvWriter = require('csv-writer').createObjectCsvWriter({ append: true ,header,path: fileName});

  try{
    await writeData(data, createCsvWriter);    
  }catch(err){
    console.log("Err=="+err.message);
  }
  
  
}

async function writeData(records, csvWriter){
  try{
    await csvWriter.writeRecords(records)
  }catch(erorr){
    console.log("Error== "+error.message);
  }
}





module.exports.daysInMonth = function (month, year) {
  return new Date(year, month, 0).getDate();
}

module.exports.arrayToCsv= function (data,headers,fileName){

    let csvRows=[];
    csvRows.push(headers.join(",")+'\r\n');

    console.log("ROW LENGTH="+csvRows.length);
    
    csvRows += data.map(function(d){
      return JSON.stringify(Object.values(d));
    })
    .join('\n') 
    .replace(/(^\[)|(\]$)/mg, '');

    //console.log(csvRows);  
    writeArrayToCSV(csvRows,fileName);
}

module.exports.utcToDate=function(utcDate){
  
  let newDate='';
  let stDate=utcDate.toISOString();
  try {
    newDate=stDate.replace(/T/,' ').replace(/\..+/, '');
  }catch(err){
    console.log(err.message);
    newDate=stDate;
  }
  return newDate;  
}



// const headers=['通話開始時間','通話開始時間','通話元番号','通話先番号','通話時間（秒）','GSX','ten'];
// const fileName='abc.csv';
// arrayToCSV(arr,headers,fileName);
/****************** send email ***************/



module.exports.sendEmail=function(mailOptions){
  var transporter = nodemailer.createTransport({
    secure: false,
    host:'103.120.16.136',
    port:587,
    auth: {
      user: 'ips_tech@sysmail.ipsism.co.jp',
      pass: '9k7rLZ2T'
    }
  });
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      return false;
    } else {
      console.log('Email sent: ' + info.response);
      return true;
    }
  });  
}

module.exports.copyCDR=function(source, target ){
  copyFolderRecursiveSync( source, target )
}


module.exports.rates={'fico':[{'mobile':'14','landLine':'6'}]};

module.exports.numberWithCommas = function(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function copyFolderRecursiveSync( source, target ) {
  var files = [];

  //check if folder needs to be created or integrated
  var targetFolder = path.join( target, path.basename( source ) );
  if ( !fs.existsSync( targetFolder ) ) {
      fs.mkdirSync( targetFolder );
  }

  //copy
  if ( fs.lstatSync( source ).isDirectory() ) {
      files = fs.readdirSync( source );
      files.forEach( function ( file ) {
          var curSource = path.join( source, file );
          if ( fs.lstatSync( curSource ).isDirectory() ) {
              copyFolderRecursiveSync( curSource, targetFolder );
          } else {
              copyFileSync( curSource, targetFolder );
          }
      } );
  }
}


function copyFileSync( source, target ) {
  var targetFile = target;

  //if target is a directory a new file with the same name will be created
  if ( fs.existsSync( target ) ) {
      if ( fs.lstatSync( target ).isDirectory() ) {
          targetFile = path.join( target, path.basename( source ) );
      }
  }
  fs.writeFileSync(targetFile, fs.readFileSync(source));
}



module.exports.createFolder=function createFolder(folderName){    
    const fs=require('fs');
    try{
        if (!fs.existsSync(folderName)){
            fs.mkdirSync(folderName,{recursive: true});
        }
    } catch (err) {
        console.error(err)
    }       

}

module.exports.splitDate=function(date){
  let year='',month='',monthName='';
  const dateVsMonths={'01':'Jan','02':'Feb','03':'March','04':'April','05':'May','06':'June','07':'July','08':'Augest','09':'Sept','10':'Oct','11':'Nov','12':'Dec'};
  try{
    let dateTmpArr=date.split(" ");
    let dateArr=dateTmpArr[0].split("-");
    year=dateArr[0];
    month=dateArr[1];
    monthName=dateVsMonths[month];    
  }catch(e){
    console.log(e.message);
  }
  return [monthName, year,month];
}

module.exports.genrateHTML=function(domesticAmount, intAmount, year, month){

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
  
}



