var utility= require('./../../public/javascripts/utility');
var db = require('./../../config/database');
const ipsPortal=true;

module.exports = {

    getTargetDate: async function(date_id) {
        try {
              const query=`SELECT max(date_set)::date + interval '0 HOURS' as target_date, max(date_set)::date - interval '9 HOURS'  as target_date_with_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
              const targetDateRes= await db.query(query,[]);
              if(targetDateRes.rows){
                  return  {'targetDate' : (targetDateRes.rows[0].target_date), 'targetDateWithTimezone' : (targetDateRes.rows[0].target_date_with_timezone)} ;              
              }
              return {err:'not found'};
          } catch (error) {
              console.log("Err "+ error.message);
              return error;
          }
      },
    
  getAllTrunkgroup: async function() {
    try {
          const query=`select trunk_port, customer_name, customer_id, incallednumber from sonus_outbound_customer order by customer_id`;
          
          const getTrunkportRes= await db.query(query,[],ipsPortal);
        //  console.log(getTrunkportRes);
          if(getTrunkportRes.rows){
              return  getTrunkportRes.rows;
            }
          return {err:'not found'};
      } catch (error) {
          console.log("Err "+ error.message);
          return error;
      }
  },    
  getSummaryData: async function(targetMonth) {
      //console.log("target month="+targetMonth);
      const year = new Date(targetMonth).getFullYear();
      let month = new Date(targetMonth).getMonth() + 1;

      if(parseInt(month,10)<10){
        month='0'+month;
      }

      try {
          const query=`select count(*) as total, sum(duration_use) as duration, start_time::date as day, billing_comp_name,billing_comp_code from cdr_sonus_outbound where to_char(start_time, 'MM-YYYY') = '${month}-${year}' group by start_time::date, billing_comp_name,billing_comp_code order by start_time::date asc `;
          const ratesRes= await db.query(query,[]);
          
          if(ratesRes.rows){
              return (ratesRes.rows);              
          }
          return {err:'not found'};
      } catch (error) {
          console.log("Err "+ error.message);
          return error;
      }
  },
  
  getSummaryDataMysql: async function(targetDateWithTimezone, customerInfo) {
    
    const day = new Date(targetDateWithTimezone).getDate();

    const startDate= new Date(targetDateWithTimezone);

    startDate.setDate(startDate.getDate() - day);
    const year = startDate.getFullYear();
    const month = startDate.getMonth() + 1;
    const date = startDate.getDate();
    const actualStartDate = year+"-"+month+"-"+date+" 15:00:00";
    let incallednumber='';
    let trunkPortsVal = '';

    if(customerInfo.incallednumber){
        incallednumber=` AND incallednumber LIKE '${customerInfo.incallednumber}'`

    }
    let trunkPorts = customerInfo.trunk_port;
    let trunkPortsArr = trunkPorts.split(",");

    for(let i=0; i<trunkPortsArr.length;i++){
       trunkPortsVal = trunkPortsVal + `'${trunkPortsArr[i]}',`;
    }
    //remove last value (,)
    if(trunkPortsVal.substr(trunkPortsVal.length - 1)==','){
       trunkPortsVal = trunkPortsVal.substring(0, trunkPortsVal.length - 1);
    }

    

    
    //console.log("customer info="+JSON.stringify(customerInfo));

    try {
        const query=`select count(*) as total, cast(addtime(starttime,'09:00:00') as Date) as day from COLLECTOR_73 where INGRPSTNTRUNKNAME in (${trunkPortsVal}) ${incallednumber} AND RECORDTYPEID = 3 AND starttime>='${actualStartDate}' and starttime <='${targetDateWithTimezone}' group by cast(addtime(starttime,'09:00:00') as Date) order by cast(addtime(starttime,'09:00:00') as Date) asc`;
        //console.log(query);
        const rawData= await db.mySQLQuery(query,[]);

        //console.log("data="+JSON.stringify(rawData));

        return (rawData);              
    } catch (error) {
        console.log("Err "+ error.message);
        return error;
    }
  },
  createTable: async function ( rawData ,processData , customerName, customerId, incallednumber){

    let html='';
    
    //console.log("proData="+proDataLen.length);
    //console.log("rawData="+rawDataLen.length);
    html= tableCreate(rawData, processData, customerName, customerId, incallednumber);
    //console.log("html");
    //console.log(html);

    return html;
  },
  sendEmail: async function(html){
   
    let mailOption={
        from: 'ips_tech@sysmail.ipsism.co.jp',
        to: 'uday@ipsism.co.jp',
       // cc:'y_ito@ipsism.co.jp',
        subject:'SONUS OUTBOUND CDR CHECK',
        html
    }

   utility.sendEmail(mailOption);                
    
  },
  
}


function tableCreate(rawData, processData, customerName, customerId, incallednumber) {

    //console.log("rawData="+JSON.stringify(rawData))
    //console.log("processData="+JSON.stringify(processData))
   // console.log("create table---");
    let tableRows='';

    let length=rawData.length, locS, locSA, locE, locEA;

    if(length==0){
        return [];
    }

    locS= new Date(rawData[0]['day']);
    locSA=locS.toLocaleString().split(",");
    locE= new Date(rawData[length-1]['day']);
    locEA=locE.toLocaleString().split(",");

    //console.log("1="+locEA[0]);

    for(let i=0;i<rawData.length;i++){
        let diff=rawData[i]['total']-processData[i]['total'];
        let loc= new Date(rawData[i]['day']);
        let locArr=loc.toLocaleString().split(",");
        let rawValue = utility.numberWithCommas(rawData[i]['total']);
        let processValue = utility.numberWithCommas(processData[i]['total']);

        tableRows+='<tr>';
        tableRows+=`<td class="day">${locArr[0]}</td>`;
        tableRows+=`<td style="text-align:right" class="Raw Data">${rawValue}</td>`;
        tableRows+=`<td style="text-align:right" class="Processed Data">${processValue}</td>`;
        tableRows+=`<td style="text-align:right" class="Difference">${diff}</td>`;

        tableRows=tableRows+'</tr>';
    }
    let html='';
    let h4=`This is the daily CDR Report of ${customerName} !! <br /><br />`;
    let h3=`${locSA[0]} ~ ${locEA[0]} !! `;
    let h2='';

    if(customerId=='106' && incallednumber=='8211%'){        
        h2=`<h2 align="center"> ${customerName} IPSMVN0S1RPRII with 8211% CDR BALANCE CHECK </h2>`;  
    }else if(customerId=='106'){
        h2=`<h2 align="center"> ${customerName} IPSW1ZKLN6PRI2,IPSW1ZN3W4PRI2 CDR BALANCE CHECK </h2>`;  
    }else    {
        h2=`<h2 align="center"> ${customerName} CDR BALANCE CHECK </h2>`;  
    }
    
    html+=h4;
    html+=h3;
    html+=h2;
    let table='';
    const style = `thead { text-align: left;background-color: #4CAF50; color: white; }`

    try{
        table+= `<table class='some-table' border="2" style='${style}'>
             <thead> <tr> <th>DATE</th> <th>SONUS RAW(192.168.11.252</th> <th>PRO(10.168.22.40)</th> <th> DIFFERENCE </th></tr> </thead>
        <tbody>
        ${tableRows}    
        </tbody>
        </table>`;


    }catch(err){
        console.log("Error "+err.message);
        return err;
    }
    let div=`<div style="margin: auto;width: 50%;padding: 10px;">${table}</div>`;
     html+=div;
     //html+="Thank you";
   // console.log("sdfsdf"+html);

    return html;
  }