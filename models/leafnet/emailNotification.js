var utility= require('./../../public/javascripts/utility');
var db = require('./../../config/database');

module.exports = {

    getTargetDate: async function(date_id) {
        try {
              const query=`SELECT max(date_set)::date + interval '0 HOURS' as target_date, max(date_set)::date - interval '9 HOURS'  as target_date_with_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
              const targetDateRes= await db.query(query,[]);
              //console.log(targetDateRes);
              if(targetDateRes.rows){
                  return  {'targetDate' : (targetDateRes.rows[0].target_date), 'targetDateWithTimezone' : (targetDateRes.rows[0].target_date_with_timezone)} ;              
              }
              return {err:'not found'};
          } catch (error) {
              return error;
          }
      },
      
  getSummaryData: async function(targetMonth) {
      console.log("target month="+targetMonth);

      const year = new Date(targetMonth).getFullYear();
      let month = new Date(targetMonth).getMonth() + 1;
      if(parseInt(month,10)<10){
          month='0'+month;
      }

      
      try {
          const query=`select count(*) as total, sum(duration_use) as duration, start_time::date as day from cdr_sonus where 
          to_char(start_time, 'MM-YYYY') = '${month}-${year}' group by start_time::date order by start_time::date asc `;
          const ratesRes= await db.query(query,[]);
          
          if(ratesRes.rows){
              return (ratesRes.rows);              
          }
          return {err:'not found'};
      } catch (error) {
          return error;
      }
  },
  
  getSummaryDataMysql: async function(targetDateWithTimezone) {
    
    const day = new Date(targetDateWithTimezone).getDate();

    const startDate= new Date(targetDateWithTimezone);

    startDate.setDate(startDate.getDate() - day);
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;
    const date = startDate.getDate();
    const actualStartDate = year+"-"+month+"-"+date+" 15:00:00";

    console.log("year=="+year+"\n month=="+month+"\n day="+day);
    console.log("start Date="+startDate);
    console.log("actual start date"+actualStartDate)


    try {
        const query=`select count(*) as total, cast(addtime(starttime,'09:00:00') as Date) as day from COLLECTOR_73 
        where EGRTGNAME in ('IPSSHG5423J7','IPSSHGF59EJ', 'IPSKRG5A00J', 'IPSKRG6BIIJ', 'IPSFUS10NWJ' ) 
        AND BILLNUM = '5050506751' 
        AND RECORDTYPEID = 3 
        AND starttime>='${actualStartDate}' and starttime <='${targetDateWithTimezone}' 
        group by cast(addtime(starttime,'09:00:00') as Date) 
        order by cast(addtime(starttime,'09:00:00') as Date) asc`;

        //console.log(query);
        const rawData= await db.mySQLQuery(query,[]);
        //console.log(JSON.stringify(rawData));
        return (rawData);              
    } catch (error) {
        return error;
    }
  },
  createTable: async function ( rawData,processData ){

    let proDataLen=processData.length;
    let rawDataLen=rawData.length;
    let html='';
    let table='';
    
    console.log("proData="+proDataLen);
    console.log("rawData="+rawDataLen);
    html= tableCreate(rawData, processData);
    //console.log("html");
    //console.log(html);

    return html;
  },
  sendEmail: async function(html){
   
    let mailOption={
        from: 'ips_tech@sysmail.ipsism.co.jp',
        to: 'uday@ipsism.co.jp',
    //    cc:'y_ito@ipsism.co.jp',
   //     cc:'gaurav@ipsism.co.jp,abhilash@ipsism.co.jp,vijay@ipsism.co.jp',
        subject:'LEAFNET CDR CHECK',
        html
    }

   utility.sendEmail(mailOption);                
    
  },
  
}


function tableCreate(rawData, processData) {
    console.log("create table---");
    let tableRows='';

    let length=rawData.length, locS, locSA, locE, locEA;

    locS= new Date(rawData[0]['day']);
    locSA=locS.toLocaleString().split(",");
    locE= new Date(rawData[length-1]['day']);
    locEA=locE.toLocaleString().split(",");

    console.log("1="+locEA[0]);

    for(let i=0;i<rawData.length;i++){
        let diff=rawData[i]['total']-processData[i]['total'];
        
        console.log("rawData[i]['day']="+rawData[i]['day']);
        console.log("processData[i]['day']="+processData[i]['day']);


        let loc= new Date(rawData[i]['day']);
        console.log("loc="+loc);

        let locArr=loc.toLocaleString().split(",");
        let rawValue = utility.numberWithCommas(rawData[i]['total']);
        let processValue = utility.numberWithCommas(processData[i]['total']);

        tableRows+='<tr>';
        tableRows+=`<td class="day">${locArr[0]}</td>`;
        tableRows+=`<td style="text-align:right" class="Raw Data">${rawValue}</td>`;
        tableRows+=`<td style="text-align:right" class="Processed Data">${processValue}</td>`;
        tableRows+=`<td style="text-align:right" class="Difference">${diff}</td>`;

        tableRows=tableRows+'</tr>'
    }
    let html='';
    let h4=`Hi, <br /> This is the daily Leafnet CDR Report!! <br /><br />`;
    let h3=`${locSA[0]} ~ ${locEA[0]} !! `;
    let h2=`<h2 align="center"> LEAFNET CDR BALANCE CHECK </h2>`;  
    html+=h4;
    html+=h3;
    html+=h2;
    let table='';
    const style = `thead { text-align: left;background-color: #4CAF50; color: white; }`

    try{
        table+= `<table class='some-table' border="2" style='${style}'>
             <thead> <tr> <th>DATE</th> <th>SONUS RAW(10.168.11.252</th> <th>PRO(10.168.22.40)</th> <th> DIFFERENCE </th></tr> </thead>
        <tbody>
        ${tableRows}    
        </tbody>
        </table>`;


    }catch(err){
        throw Error("Error !"+err);
    }
    let div=`<div style="margin: auto;width: 50%;padding: 10px;">${table}</div>`;
     html+=div;
     html+="Thank you";
   // console.log("sdfsdf"+html);

    return html;
  }