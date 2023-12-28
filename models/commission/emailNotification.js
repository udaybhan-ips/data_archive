var utility = require('./../../public/javascripts/utility');
var db = require('./../../config/database');

module.exports = {

    getTargetDate: async function (date_id) {
        try {
          const query = `SELECT max(date_set)::date as target_billing_month, max(date_set)::date as current_montth FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
          const targetDateRes = await db.query(query, []);
    
          if (targetDateRes.rows) {
            return { 'target_billing_month': (targetDateRes.rows[0].target_billing_month), 'current_montth': (targetDateRes.rows[0].current_montth) };
          }
          return { err: 'not found' };
        } catch (error) {
          return error;
        }
      },

      getAllCommissionCustomer: async function (customerId) {
        try {
    
          let WHERE = "";
    
          if(customerId){
            WHERE = `where customer_cd = '${customerId}' and is_deleted = false `
          }else{
            WHERE = `where is_deleted = false `
          }
    
          let customerList = []
    
          const getAllCustomerList = `select id, customer_cd, customer_name, commission from m_customer ${WHERE} limit 3` ; 
          const getAllCustomerListRes = await db.query(getAllCustomerList, [], true);
    
          const getAllAgentList = `select agent_code from agent_incentive where edat_fini::date > now() and deleted=false  ` ; 
          const getAllAgentListRes = await db.queryByokakin(getAllAgentList, []);
          
          if(getAllCustomerListRes && getAllCustomerListRes.rows && getAllCustomerListRes.rows.length > 0 && getAllAgentListRes 
            && getAllAgentListRes.rows && getAllAgentListRes.rows.length>0 ) {
    
            customerList = getAllCustomerListRes.rows.filter((obj) => {
              let ind = -1
              ind = getAllAgentListRes.rows.findIndex((ele) => (ele.agent_code==obj.customer_cd));
              return ind === -1 ? false : true;      
            })
          }
    
          console.log("customer list=="+JSON.stringify(customerList))
    
          return customerList;
          
        } catch (error) {
          return error;
        }
      },

    getEmailDetails: async function (customerId) {
        
        try {
          const query = `select * from agent_commission_config where agent_id ='${customerId}'  and deleted = false limit 1`;
            const ratesRes = await db.queryByokakin(query, []);

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
    sendEmail: async function (emailDetails, customerId) {

        console.log("email details .."+JSON.stringify(emailDetails))

        if(emailDetails && emailDetails.length<=0){
            throw new Error('Email details are not valid! Please check email config for this customer Id '+customerId)
        }



        let emailSubject = emailDetails[0]['email_subject'] ; 
        let emailContent = emailDetails[0]['email_content'] ; 
        let paymentDueDateMode = emailDetails[0]['payment_due_date_mode'] ; 
        let emailTo = emailDetails[0]['email_to'] ; 
        let emailCc = emailDetails[0]['email_cc'] ; 
        //let payment_due_date_mode = emailDetails[0]['payment_due_date_mode'] ; 

        let html = '';
        
        html += emailContent ; 

        let mailOption = {
            from: 'ips_tech@sysmail.ipsism.co.jp',
            to: emailTo,
            cc:emailTo,
            subject: emailSubject,
            html
        }
        console.log("1")

       let res = await utility.sendEmailTesting(mailOption);
        console.log("2")
       
        return res ;
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