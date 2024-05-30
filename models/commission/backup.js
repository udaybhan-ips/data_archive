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

      if (customerId) {
        WHERE = `where customer_cd in ( '00000451','00000850','00001021','00001029' ) and is_deleted = false `
      } else {
        WHERE = `where is_deleted = false `
      }

      let customerList = []

      const getAllCustomerList = `select id, customer_cd, customer_name, commission from m_customer ${WHERE} `;
      const getAllCustomerListRes = await db.query(getAllCustomerList, [], true);

      const getAllAgentList = `select agent_code from agent_incentive where edat_fini::date > now() and deleted=false  `;
      const getAllAgentListRes = await db.queryByokakin(getAllAgentList, []);

      if (getAllCustomerListRes && getAllCustomerListRes.rows && getAllCustomerListRes.rows.length > 0 && getAllAgentListRes
        && getAllAgentListRes.rows && getAllAgentListRes.rows.length > 0) {

        customerList = getAllCustomerListRes.rows.filter((obj) => {
          let ind = -1
          ind = getAllAgentListRes.rows.findIndex((ele) => (ele.agent_code == obj.customer_cd));
          return ind === -1 ? false : true;
        })
      }

      console.log("customer list==" + JSON.stringify(customerList))

      return customerList;

    } catch (error) {
      return error;
    }
  },

  getEmailDetails: async function (customerId, year, month) {

    try {
      const query = `select * from agent_commission_email_history where customer_id='${customerId}' and billing_month::date ='${year}-${month}-01' `;
      const ratesRes = await db.queryByokakin(query, []);

      if (ratesRes.rows) {
        return (ratesRes.rows);
      }
      return { err: 'not found' };
    } catch (error) {
      return error;
    }
  },

  sendEmail: async function (emailDetails, customerId, customerDetails, billingYear, billingMonth) {

    try{
    console.log("email details .." + JSON.stringify(emailDetails))

    let lengthEmail = emailDetails.length;

    

    if (lengthEmail == 0) {
      throw new Error('Email details are not valid! Please check email config for this customer Id ' + customerId)
    }

    console.log("current dir.." + __dirname);

    let attachments = [], obj ={};
    let customerName = customerDetails.customer_name;
   // let emailSubject = emailDetails[0]['email_subject'];
    let emailSubject = "【2023年11月～2024年4月分】FDコミッション通知書のお知らせ(株式会社アイ・ピー・エス・プロ)";
    let emailContent = emailDetails[0]['email_contents'].replace(/\n/g, "<br />");

    let paymentDueDateMode = emailDetails[0]['payment_due_date_mode'];

    let emailTo = emailDetails[0]['email_to'];
    let emailCc = emailDetails[0]['email_cc'];
    

    let filename = `10${customerId}_${billingYear}${billingMonth}_${customerName}.pdf`;
    let path = __dirname + `\\pdf\\10${customerId}_${billingYear}${billingMonth}_${customerName}.pdf`;



    if(customerId ==='00000451' || customerId ==='00000850' || customerId ==='00001021' || customerId ==='00001029' ){
      attachments = [{
          filename: `10${customerId}_202311_${customerName}.pdf`,
          path: __dirname + `\\pdf\\10${customerId}_202311_${customerName}.pdf`
        },{
          filename: `10${customerId}_202312_${customerName}.pdf`,
          path: __dirname + `\\pdf\\10${customerId}_202312_${customerName}.pdf`
        },
        {
          filename: `10${customerId}_202401_${customerName}.pdf`,
          path: __dirname + `\\pdf\\10${customerId}_202401_${customerName}.pdf`
        },{
          filename: `10${customerId}_202402_${customerName}.pdf`,
          path: __dirname + `\\pdf\\10${customerId}_202402_${customerName}.pdf`
        },{
          filename: `10${customerId}_202403_${customerName}.pdf`,
          path: __dirname + `\\pdf\\10${customerId}_202403_${customerName}.pdf`
        },{
          filename: `10${customerId}_202404_${customerName}.pdf`,
          path: __dirname + `\\pdf\\10${customerId}_202404_${customerName}.pdf`
        }]


       // attachments.push(obj)            

    }else{
     obj= {   // file on disk as an attachment
        filename: filename,
        path: path // stream this file
      }
      attachments.push(obj)
    }

   // attachments.push(obj)


    

    console.log(emailDetails[0]['email_to'])
    console.log(emailDetails[0]['email_cc'])

   // emailTo = 'uday@ipspro.co.jp';
   // emailCc = 'r_kobayashi@ipspro.co.jp';
    let emailBCC = 'uday@ipspro.co.jp';
    //  emailSubject = "テストメール（株式会社アイ・ピー・エス・プロ）";

    let html = '';
    html += emailContent;

  

   

    //       filename = `コミッション通知書(テスト).pdf`;
    //     path = __dirname + `\\pdf\\コミッション通知書(テスト).pdf`;


    console.log("file name is .." + filename)
    console.log("path is .." + path)

    let mailOption = {
      from: 'ipsp_billing@sysmail.ipspro.co.jp',
      to: emailTo,
      cc: emailCc,
      bcc: emailBCC,
      subject: emailSubject,
      html,
      attachments: attachments
    }
    console.log("1")

    let res = await utility.sendEmailIPSPro(mailOption);
    console.log("2")

    return res;

  }catch(err){

    console.log("error is "+err.message)
  }
  },

}
