var BillingSougo = require('../../models/sougo/billing');
const dateId = 3;

module.exports = {
  getData: async function (req, res) {
    try {


      // console.log("ratesDetails="+JSON.stringify(ratesDetails));

      const [getCompListRes, getCompListErr] = await handleError(BillingSougo.getAllCompCode());
      if (getCompListErr) {
        throw new Error('Could not fetch Sougo Company list details');
      }
      const [getCarrierInfoRes, getCarrierInfoErr] = await handleError(BillingSougo.getCarrierInfo());
      if (getCarrierInfoErr) {
        throw new Error('Could not fetch carrier list details');
      }

      console.log("length==" + getCompListRes.length);

      const [Dates, targetDateErr] = await handleError(BillingSougo.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }

      const billingYear = new Date(Dates.target_billing_month).getFullYear();

      let billingMonth = new Date(Dates.target_billing_month).getMonth() + 1;
      if (parseInt(billingMonth, 10) < 10) {
        billingMonth = '0' + billingMonth;
      }


      const [ratesDetails, ratesErr] = await handleError(BillingSougo.getRates());
      if (ratesErr) {
        throw new Error('Could not fetch Rates details');
      }

      for (let i = 0; i < getCompListRes.length; i++) {

      //   const [BillNoArr, getBillNoErr] = await handleError(BillingSougo.getBillNoInfo());
      //   if (getBillNoErr) {
      //     throw new Error('Could not fetch bill no');
      //   }
      //   console.log("bill_no " + BillNoArr.max_bill_no);

      //   let bill_no = parseInt(BillNoArr.max_bill_no, 10) + 1;
      //  //let bill_no = 2200;

      //   const [getCDRRes, getCDRResErr] = await handleError(BillingSougo.getTargetCDR( getCompListRes[i]['company_code'], billingYear, billingMonth));
      //   if (getCDRResErr) {
      //     throw new Error('Could not fetch CDRes');
      //   }

      //   const [createDetailDataRes, createDetailDataErr] = await handleError(BillingSougo.createDetailData(bill_no, getCompListRes[i]['company_code'], billingYear, billingMonth,ratesDetails, getCDRRes  ,getCarrierInfoRes));
      //   if (createDetailDataErr) {
      //     throw new Error('Could not fetch CDRes');
      //   }

        const [createInvoiceFCRes, createInvoiceFCErr] = await handleError(BillingSougo.genrateInvoice(getCompListRes[i]['company_code'], billingYear, billingMonth, Dates.current_month));

        if (createInvoiceFCErr) {
          throw new Error('Error while creating invoice ' + createInvoiceFCErr.message);
        }

      }



      // const [billing, billingErr] = await handleError(BillingSougo.insertByBatches(getCDRRes, ratesDetails));
      // if(billingErr) {
      //     throw new Error('Error while billing '+ billingErr);  
      // }

      // const [deleteSummaryRes, deleteSummaryErr] = await handleError(BillingSougo.deleteSummaryData(customerId, billingYear, billingMonth));
      // if(deleteSummaryErr) {
      //     throw new Error('Error while delete summary data '+ deleteSummaryErr);  
      // }


      // const [sendNotificationRes, sendNotificationErr] = await handleError(BillingSougo.sendNotification(customerId, billingYear, billingMonth,Dates.current_montth));

      // if(sendNotificationErr) {
      //     throw new Error('Error while creating invoice '+ sendNotificationErr.message);  
      // }


      return {
        message: 'success! data inserted sucessfully',
      };
    } catch (error) {

      console.log("Error !!!" + error.message);
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