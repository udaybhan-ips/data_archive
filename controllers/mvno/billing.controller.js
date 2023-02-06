var BillingMVNO = require('../../models/mvno/billing');

module.exports = {
  getData: async function (req, res) {
    const dateId = 5;
    try {

      const [Dates, targetDateErr] = await handleError(BillingMVNO.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }

      const billingYear = new Date(Dates.target_billing_month).getFullYear();
      let billingMonth = new Date(Dates.target_billing_month).getMonth() + 1;

      if (parseInt(billingMonth, 10) < 10) {
        billingMonth = '0' + billingMonth;
      }

      const [customerListRes, customerListErr] = await handleError(BillingMVNO.getAllMVNOCustomer(dateId));
      if (customerListErr) {
        throw new Error('Could not fetch customer list');
      }

      for (let i = 0; i < customerListRes.length; i++) {


        if (customerListRes[i]['customer_name'] == 'FPHONE') {
          
          

          const [deleteSummaryRes, deleteSummaryErr] = await handleError(BillingMVNO.deleteSummaryDataLeg(customerListRes[i]['customer_name'], customerListRes[i]['customer_id'], billingYear, billingMonth, customerListRes[i]['did'], customerListRes[i]['leg']));
          if (deleteSummaryErr) {
            throw new Error('Error while delete summary data ' + deleteSummaryErr);
          }

          const [createSummaryRes, createSummaryErr] = await handleError(BillingMVNO.createSummaryDataLeg(customerListRes[i]['customer_name'], customerListRes[i]['customer_id'], billingYear, billingMonth, customerListRes[i]['did'],'',customerListRes[i]['leg']));
          if (createSummaryErr) {
            throw new Error('Error while creating summary data ' + createSummaryErr);
          }

        } else if(customerListRes[i]['customer_name'] == 'MEISHIN') {

          const [deleteSummaryRes, deleteSummaryErr] = await handleError(BillingMVNO.deleteSummaryData(customerListRes[i]['customer_name'], customerListRes[i]['customer_id'], billingYear, billingMonth, customerListRes[i]['did']));
          if (deleteSummaryErr) {
            throw new Error('Error while delete summary data ' + deleteSummaryErr);
          }

          const [createSummaryRes, createSummaryErr] = await handleError(BillingMVNO.createSummaryData(customerListRes[i]['customer_name'], customerListRes[i]['customer_id'], billingYear, billingMonth, customerListRes[i]['did']));
          if (createSummaryErr) {
            throw new Error('Error while creating summary data ' + createSummaryErr);
          }

        }else if(customerListRes[i]['customer_name'] == 'XMOBILE') {

          const [deleteSummaryRes, deleteSummaryErr] = await handleError(BillingMVNO.deleteSummaryDataLeg(customerListRes[i]['customer_name'], customerListRes[i]['customer_id'], billingYear, billingMonth, customerListRes[i]['did'], customerListRes[i]['leg']));
          if (deleteSummaryErr) {
            throw new Error('Error while delete summary data ' + deleteSummaryErr);
          }

          const [createSummaryRes, createSummaryErr] = await handleError(BillingMVNO.createSummaryDataLeg(customerListRes[i]['customer_name'], customerListRes[i]['customer_id'], billingYear, billingMonth, customerListRes[i]['did'],'',customerListRes[i]['leg']));
          if (createSummaryErr) {
            throw new Error('Error while creating summary data ' + createSummaryErr);
          }
          
        }else {

          const [deleteSummaryRes, deleteSummaryErr] = await handleError(BillingMVNO.deleteSummaryData(customerListRes[i]['customer_name'], customerListRes[i]['customer_id'], billingYear, billingMonth, customerListRes[i]['did']));
          if (deleteSummaryErr) {
            throw new Error('Error while delete summary data ' + deleteSummaryErr);
          }

          const [createSummaryRes, createSummaryErr] = await handleError(BillingMVNO.createSummaryData(customerListRes[i]['customer_name'], customerListRes[i]['customer_id'], billingYear, billingMonth, customerListRes[i]['did']));
          if (createSummaryErr) {
            throw new Error('Error while creating summary data ' + createSummaryErr);
          }

        }
      }
      // const [sendNotificationRes, sendNotificationErr] = await handleError(BillingMVNO.sendNotification( billingYear, billingMonth));

      // if(sendNotificationErr) {
      //     throw new Error('Error while sending motification '+ sendNotificationErr.message);  
      // }

      console.log("Done....")


    } catch (error) {
      console.log("Error!!" + error.message);
      return {
        message: error
      };
    }
  },
}

const handleError = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}