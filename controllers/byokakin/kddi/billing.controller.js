var BillingByokakin = require('../../../models/byokakin/kddi/billing');
const dateId = 3;

module.exports = {
  cdrProcessing: async function (req, res) {
    try {

      const billingMonth = '08', billingYear = "2023";

      // console.log("ratesDetails="+JSON.stringify(ratesDetails));

      const [getKDDICompListRes, getKDDICompListErr] = await handleError(BillingByokakin.getKDDICompList());
      if (getKDDICompListErr) {
        throw new Error('Could not fetch Byokakin Company list details');
      }
      console.log("getKDDICompListRes==" + JSON.stringify(getKDDICompListRes));

      for (let i = 0; i < getKDDICompListRes.length; i++) {

        //delete processed data

        const [deleteProcessedDataRes, deleteProcessedDataErr] = await handleError(BillingByokakin.deleteProcessedData(getKDDICompListRes[i]['customer_code'],billingYear, billingMonth));
        if (deleteProcessedDataErr) {
          throw new Error('Could not delete processed data!!');
        }

        // outbound data processing

        const [ratesDetails, ratesErr] = await handleError(BillingByokakin.getRates(getKDDICompListRes[i]['customer_code']));
        if (ratesErr) {
          throw new Error('Could not fetch Rates details');
        }

        if(ratesDetails.length <=0){
          console.log("Rates are not defined for this company..");          
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

       

        const [getInboundRAWCDRRes, getInboundRAWCDRError] = await handleError(BillingByokakin.getKDDIRAWInboundData(billingYear, billingMonth, getKDDICompListRes[i]['customer_code']));
        if (getInboundRAWCDRError) {
          throw new Error('Could not fetch inbound RAW cdr details');
        }


        const [createDetailsInboundRes, createDetailsInboundErr] = await handleError(BillingByokakin.insertProcessedDataByBatches('INBOUND', getInboundRAWCDRRes, ratesDetails, getKDDICompListRes[i]['customer_code'], billingYear, billingMonth));
        if (createDetailsInboundErr) {
          throw new Error('Error while creating summary data ' + createDetailsInboundErr);
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

  getData: async function (req, res) {
    try {

      const billingMonth = '08', billingYear = "2023";

      // console.log("ratesDetails="+JSON.stringify(ratesDetails));

      const [getKDDICompListRes, getKDDICompListErr] = await handleError(BillingByokakin.getKDDICompList());
      if (getKDDICompListErr) {
        throw new Error('Could not fetch Byokakin Company list details');
      }
      console.log("getKDDICompListRes==" + JSON.stringify(getKDDICompListRes));

      for (let i = 0; i < getKDDICompListRes.length; i++) {

        
        //finish
        /*****  create summary data for byokakin */

        const [deleteSummaryDataRes, deleteSummaryDataErr] = await handleError(BillingByokakin.deleteSummaryData(getKDDICompListRes[i]['customer_code'], billingYear, billingMonth));
        if (deleteSummaryDataErr) {
          throw new Error('error'+deleteSummaryDataErr);
        }

        const [getSummaryDataRes, getSummaryDataErr] = await handleError(BillingByokakin.getSummaryData(getKDDICompListRes[i]['customer_code'], billingYear, billingMonth));
        if (getSummaryDataErr) {
          throw new Error('error'+getSummaryDataErr);
        }

        const [createSummaryRes, createSummaryErr] = await handleError(BillingByokakin.createSummaryData('bill_no', getKDDICompListRes[i]['customer_code'], billingYear, billingMonth, getSummaryDataRes));
        if (createSummaryErr) {
          throw new Error('Error while creating summary data ' + createSummaryErr);
        }

        const [createInvoiceRes, createInvoiceErr] = await handleError(BillingByokakin.genrateInvoice(getKDDICompListRes[i]['customer_code'], getKDDICompListRes[i]['customer_name'], billingYear, billingMonth));

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