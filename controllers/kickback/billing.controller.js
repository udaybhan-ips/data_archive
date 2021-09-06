var BillingKickback = require('../../models/kickback/billing');
const dateId = 3;

module.exports = {
  getData: async function (req, res) {
    try {


      // console.log("ratesDetails="+JSON.stringify(ratesDetails));

      const [getKickCompListRes, getKickCompListErr] = await handleError(BillingKickback.getKickCompList());
      if (getKickCompListErr) {
        throw new Error('Could not fetch Kickback Company list details');
      }
      const [getCarrierInfoRes, getCarrierInfoErr] = await handleError(BillingKickback.getCarrierInfo());
      if (getCarrierInfoErr) {
        throw new Error('Could not fetch carrier list details');
      }


      console.log("getKickCompListRes==" + JSON.stringify(getKickCompListRes));
      console.log(typeof (getKickCompListRes));


      console.log("length==" + getKickCompListRes.length);

      const [Dates, targetDateErr] = await handleError(BillingKickback.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }

      const billingYear = new Date(Dates.target_billing_month).getFullYear();

      let billingMonth = new Date(Dates.target_billing_month).getMonth() + 1;
      if (parseInt(billingMonth, 10) < 10) {
        billingMonth = '0' + billingMonth;
      }

      const [ratesDetails, ratesErr] = await handleError(BillingKickback.getRatesFC());
      if (ratesErr) {
        throw new Error('Could not fetch Rates details');
      }

      for (let i = 0; i < getKickCompListRes.length; i++) {

        let getCDRRes, getCDRResErr;

        const [BillNoArr, getBillNoErr] = await handleError(BillingKickback.getBillNoInfo());
        if (getBillNoErr) {
          throw new Error('Could not fetch bill no');
        }
        console.log("bill_no " + BillNoArr.max_bill_no);

        let bill_no = parseInt(BillNoArr.max_bill_no, 10) + 1;

        const [get03NumbersRes, get03NumbersErr] = await handleError(BillingKickback.get03NumbersValid(getKickCompListRes[i]['customer_id']));
        if (get03NumbersErr) {
          throw new Error('Could not fetch 03 numbers details');
        }
        //Rate Base
        if (getKickCompListRes[i]['service_type'] == 'rate_base') {

          console.log(" In rate base");

          const [ratesDetails, ratesErr] = await handleError(BillingKickback.getRates(getKickCompListRes[i]['customer_id']));
          if (ratesErr) {
            throw new Error('Could not fetch Rates details');
          }
           [getCDRRes, getCDRResErr] = await handleError(BillingKickback.getTargetCDR(getKickCompListRes[i]['customer_id'], getKickCompListRes[i]['service_type'], billingYear, billingMonth, get03NumbersRes));
          if (getCDRResErr) {
            throw new Error('Could not fetch CDRes');
          }
          const [createDetailsRes, createDetailsErr] = await handleError(BillingKickback.createDetailData(bill_no, getKickCompListRes[i]['customer_id'], billingYear, billingMonth, get03NumbersRes, getCDRRes));
          if (createDetailsErr) {
            throw new Error('Error while creating summary data ' + createDetailsErr);
          }
          const [createSummaryRes, createSummaryErr] = await handleError(BillingKickback.createSummaryData(bill_no, getKickCompListRes[i]['customer_id'], billingYear, billingMonth, ratesDetails, getCDRRes));
          if (createSummaryErr) {
            throw new Error('Error while creating summary data ' + createSummaryErr);
          }

          const [createInvoiceRes, createInvoiceErr] = await handleError(BillingKickback.genrateInvoice(getKickCompListRes[i]['customer_id'], getKickCompListRes[i]['service_type'], billingYear, billingMonth, Dates.current_montth));

          if (createInvoiceErr) {
            throw new Error('Error while creating invoice ' + createInvoiceErr.message);
          }



        } else {
          // Facility        
          //check data limit
          console.log(" In Facility");

            const [getKickCompCallsInfoRes, getKickCompCallsInfoErr] = await handleError(BillingKickback.getKickCompCallsInfo(getKickCompListRes[i]['customer_id']));
            if (getKickCompCallsInfoErr) {
              throw new Error('Error while creating summary data ' + getKickCompCallsInfoErr.message);
            }

            if (getKickCompCallsInfoRes && getKickCompCallsInfoRes[0]) {

              if (getKickCompCallsInfoRes[0]['total_duration'] > getKickCompListRes[i]['cell_phone_limit']) {
                console.log("Exceed limit");
                const [getExceedLimitRes, getExceedLimitErr] = await handleError(BillingKickback.getTargetDateByTermUse(getKickCompListRes[i]));
                if (getExceedLimitErr) {
                  throw new Error('Error while creating summary data ' + getExceedLimitErr.message);
                }

                [getCDRRes, getCDRResErr] = await handleError(BillingKickback.getTargetCDR(getKickCompListRes[i]['customer_id'], getKickCompListRes[i]['service_type'], billingYear, billingMonth, get03NumbersRes,true , getExceedLimitRes.limit_date_time));
                if (getCDRResErr) {
                  throw new Error('Could not fetch CDRes');
                }

              } else {
                console.log("No Exceed limit"+ getKickCompCallsInfoRes[0]['total_duration']);
                [getCDRRes, getCDRResErr] = await handleError(BillingKickback.getTargetCDR(getKickCompListRes[i]['customer_id'], getKickCompListRes[i]['service_type'], billingYear, billingMonth, get03NumbersRes, null, null));
                if (getCDRResErr) {
                  throw new Error('Could not fetch CDRes');
                }
              }
            }

          //   console.log("getCDRRes");
          //   console.log(JSON.stringify(getCDRRes));


            const [createDetailDataFCRes, createDetailDataFCErr] = await handleError(BillingKickback.createDetailDataFC(bill_no, getKickCompListRes[i]['customer_id'], billingYear, billingMonth, ratesDetails, getCDRRes, getCarrierInfoRes,getKickCompListRes[i]['service_type']));
            if (createDetailDataFCErr) {
              throw new Error('Error while creating summary data ' + createDetailDataFCErr);
            }

          const [createInvoiceFCRes, createInvoiceFCErr] = await handleError(BillingKickback.genrateInvoice(getKickCompListRes[i]['customer_id'], getKickCompListRes[i]['service_type'], billingYear, billingMonth, Dates.current_montth));

          if (createInvoiceFCErr) {
            throw new Error('Error while creating invoice ' + createInvoiceFCErr.message);
          }

        }



      }



      // const [billing, billingErr] = await handleError(BillingKickback.insertByBatches(getCDRRes, ratesDetails));
      // if(billingErr) {
      //     throw new Error('Error while billing '+ billingErr);  
      // }

      // const [deleteSummaryRes, deleteSummaryErr] = await handleError(BillingKickback.deleteSummaryData(customerId, billingYear, billingMonth));
      // if(deleteSummaryErr) {
      //     throw new Error('Error while delete summary data '+ deleteSummaryErr);  
      // }


      // const [sendNotificationRes, sendNotificationErr] = await handleError(BillingKickback.sendNotification(customerId, billingYear, billingMonth,Dates.current_montth));

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

  // createInvoiceFile: async function (req, res) {

  //   try {

  //     const [createInvoiceRes, createInvoiceErr] = await BillingKickback.genrateInvoice();

  //     if (createInvoiceErr) {
  //       throw new Error('Error while billing ' + createInvoiceErr.message);
  //     }

  //     console.log({ message: 'success!' });
  //   } catch (err) {
  //     console.log("Error !!=" + err.message);
  //   }


  // },

}




const handleError = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}