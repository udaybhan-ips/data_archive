var BillingByokakin = require('../../../models/byokakin/ntt_orix/billing');
const dateId = 3;
const billingMonth = '05', billingYear = "2024";
const carrier = 'NTTORIX'

module.exports = {


  cdrProcessing: async function (req, res) {
    try {

      // console.log("ratesDetails="+JSON.stringify(ratesDetails));

      const [getNTTCompListRes, getNTTCompListErr] = await handleError(BillingByokakin.getNTTCompList(billingYear, billingMonth));
      if (getNTTCompListErr) {
        throw new Error('Could not fetch Byokakin Company list details');
      }
      console.log("getNTTCompListRes==" + JSON.stringify(getNTTCompListRes));

      for (let i = 0; i < getNTTCompListRes.length; i++) {

        // const [BillNoArr, getBillNoErr] = await handleError(BillingByokakin.getBillNoInfo());
        // if (getBillNoErr) {
        //   throw new Error('Could not fetch bill no');
        // }

        // console.log("bill_no " + BillNoArr.max_bill_no);

        // let bill_no = parseInt(BillNoArr.max_bill_no, 10) + 1;

        // delete processed data first...

        const [deleteProcessedDataRes, deleteProcessedDataErr] = await handleError(BillingByokakin.deleteProcessedData(getNTTCompListRes[i]['customer_code'], billingYear, billingMonth));
        if (deleteProcessedDataErr) {
          throw new Error('Could not delete ntt orix processed data...');
        }




        // outbound data processing


        const [ratesDetails, ratesErr] = await handleError(BillingByokakin.getRates(getNTTCompListRes[i]['customer_code']));
        if (ratesErr) {
          throw new Error('Could not fetch Rates details');
        }

        const [getOutboundRAWCDRRes, getOutboundRAWCDRError] = await handleError(BillingByokakin.getNTTOutboundRAWData(billingYear, billingMonth, getNTTCompListRes[i]['customer_code']));
        if (getOutboundRAWCDRError) {
          throw new Error('Could not fetch outbound RAW cdr details');
        }

        const [createDetailsRes, createDetailsErr] = await handleError(BillingByokakin.insertProcessedDataByBatches('OUTBOUND', carrier, getOutboundRAWCDRRes, ratesDetails, getNTTCompListRes[i]['customer_code'], billingYear, billingMonth ));
        if (createDetailsErr) {
          throw new Error('Error while creating summary data ' + createDetailsErr);
        }

        // //inbound data processing

        const [getInboundRAWCDRRes, getInboundRAWCDRError] = await handleError(BillingByokakin.getNTTRAWInboundData(billingYear, billingMonth, getNTTCompListRes[i]['customer_code']));
        if (getInboundRAWCDRError) {
          throw new Error('Could not fetch inbound RAW cdr details');
        }


        const [createDetailsInboundRes, createDetailsInboundErr] = await handleError(BillingByokakin.insertProcessedDataByBatches('INBOUND', carrier, getInboundRAWCDRRes, ratesDetails, getNTTCompListRes[i]['customer_code'], billingYear, billingMonth));
        if (createDetailsInboundErr) {
          throw new Error('Error while creating summary data ' + createDetailsInboundErr);
        }
        
      }

     

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


      // console.log("ratesDetails="+JSON.stringify(ratesDetails));

      const [getNTTCompListRes, getNTTCompListErr] = await handleError(BillingByokakin.getNTTCompList(billingYear, billingMonth));
      if (getNTTCompListErr) {
        throw new Error('Could not fetch Byokakin Company list details');
      }
      console.log("getNTTCompListRes==" + JSON.stringify(getNTTCompListRes));

      for (let i = 0; i < getNTTCompListRes.length; i++) {

        // const [BillNoArr, getBillNoErr] = await handleError(BillingByokakin.getBillNoInfo());
        // if (getBillNoErr) {
        //   throw new Error('Could not fetch bill no');
        // }

        // console.log("bill_no " + BillNoArr.max_bill_no);

        // let bill_no = parseInt(BillNoArr.max_bill_no, 10) + 1;


        const [getSummaryDataRes, getSummaryDataErr] = await handleError(BillingByokakin.getSummaryData(getNTTCompListRes[i]['customer_code'], billingYear, billingMonth));
        if (getSummaryDataErr) {
          throw new Error('error'+getSummaryDataErr);
        }

        

        const [createSummaryRes, createSummaryErr] = await handleError(BillingByokakin.createSummaryData('bill_no', getNTTCompListRes[i]['customer_code'], billingYear, billingMonth, getSummaryDataRes));
        if (createSummaryErr) {
          throw new Error('Error while creating summary data ' + createSummaryErr);
        }

        const [createInvoiceRes, createInvoiceErr] = await handleError(BillingByokakin.genrateInvoice(getNTTCompListRes[i]['customer_code'], getNTTCompListRes[i]['customer_name'],  billingYear, billingMonth, carrier));

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