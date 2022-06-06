var BillingByokakin = require('../../../models/byokakin/kddi/billing');
const dateId = 3;

module.exports = {
  getData: async function (req, res) {
    try {

      const billingMonth = '04', billingYear = "2022";

      // console.log("ratesDetails="+JSON.stringify(ratesDetails));

      const [getKDDICompListRes, getKDDICompListErr] = await handleError(BillingByokakin.getKDDICompList());
      if (getKDDICompListErr) {
        throw new Error('Could not fetch Byokakin Company list details');
      }
      console.log("getKDDICompListRes==" + JSON.stringify(getKDDICompListRes));

      for (let i = 0; i < getKDDICompListRes.length; i++) {

        // const [BillNoArr, getBillNoErr] = await handleError(BillingByokakin.getBillNoInfo());
        // if (getBillNoErr) {
        //   throw new Error('Could not fetch bill no');
        // }

        // console.log("bill_no " + BillNoArr.max_bill_no);

        // let bill_no = parseInt(BillNoArr.max_bill_no, 10) + 1;



        // outbound data processing


        const [ratesDetails, ratesErr] = await handleError(BillingByokakin.getRates(getKDDICompListRes[i]['customer_code']));
        if (ratesErr) {
          throw new Error('Could not fetch Rates details');
        }

        const [getOutboundRAWCDRRes, getOutboundRAWCDRError] = await handleError(BillingByokakin.getKDDIOutboundRAWData(billingYear, billingMonth, getKDDICompListRes[i]['customer_code']));
        if (getOutboundRAWCDRError) {
          throw new Error('Could not fetch outbound RAW cdr details');
        }

        const [createDetailsRes, createDetailsErr] = await handleError(BillingByokakin.insertProcessedDataByBatches('OUTBOUND', getOutboundRAWCDRRes, ratesDetails, getKDDICompListRes[i]['customer_code'], billingYear, billingMonth ));
        if (createDetailsErr) {
          throw new Error('Error while creating summary data ' + createDetailsErr);
        }

        // inbound data processing

        const [ratesInbDetails, ratesInbErr] = await handleError(BillingByokakin.getInboundRates(getKDDICompListRes[i]['customer_code']));
        if (ratesInbErr) {
          throw new Error('Could not fetch Rates details');
        }

        const [getInboundRAWCDRRes, getInboundRAWCDRError] = await handleError(BillingByokakin.getKDDIRAWInboundData(billingYear, billingMonth, getKDDICompListRes[i]['customer_code']));
        if (getInboundRAWCDRError) {
          throw new Error('Could not fetch inbound RAW cdr details');
        }


        const [createDetailsInboundRes, createDetailsInboundErr] = await handleError(BillingByokakin.insertProcessedDataByBatches('INBOUND', getInboundRAWCDRRes, ratesInbDetails, getKDDICompListRes[i]['customer_code'], billingYear, billingMonth));
        if (createDetailsInboundErr) {
          throw new Error('Error while creating summary data ' + createDetailsInboundErr);
        }

        //finish
        /*****  create summary data for byokakin */

        const [getSummaryDataRes, getSummaryDataErr] = await handleError(BillingByokakin.getSummaryData(getKDDICompListRes[i]['customer_code'], billingYear, billingMonth));
        if (getSummaryDataErr) {
          throw new Error('error'+getSummaryDataErr);
        }

        const [createSummaryRes, createSummaryErr] = await handleError(BillingByokakin.createSummaryData('bill_no', getKDDICompListRes[i]['customer_code'], billingYear, billingMonth, getSummaryDataRes));
        if (createSummaryErr) {
          throw new Error('Error while creating summary data ' + createSummaryErr);
        }

        const [createInvoiceRes, createInvoiceErr] = await handleError(BillingByokakin.genrateInvoice(getKDDICompListRes[i]['customer_code'],  billingYear, billingMonth));

        if (createInvoiceErr) {
          throw new Error('Error while creating invoice ' + createInvoiceErr.message);
        }

      }

      console.log("done..")

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