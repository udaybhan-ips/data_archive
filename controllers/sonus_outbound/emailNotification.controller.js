var EmailNotification = require('../../models/sonus_outbound/emailNotification');

module.exports = {

  sendEmail: async function (req, res) {
    const dateId = '2';
    try {
      const [Dates, targetDateErr] = await handleError(EmailNotification.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }

      const getAllTrunkgroupRes = await EmailNotification.getAllTrunkgroup();

      const [proDataRes, proDataErr] = await handleError(EmailNotification.getSummaryData(Dates.targetDateWithTimezone));

      if (proDataErr) {
        throw new Error('error while fetching data processed data');
      }

      let RawDataRes = await EmailNotification.getSummaryDataMysql(Dates.targetDateWithTimezone, getAllTrunkgroupRes);

      let html = '<div>Hi</div>';
      
      html = html + await EmailNotification.createTableSummary(proDataRes, RawDataRes);

      for (let i = 0; i < getAllTrunkgroupRes.length; i++) {
        const proDataCustomerWise = await proDataRes.filter((obj) => {
          return (obj.billing_comp_code == getAllTrunkgroupRes[i]['customer_id'] ? true : false)
        })

        html = html + await EmailNotification.createTable(proDataCustomerWise, getAllTrunkgroupRes[i]);
      }

      // console.log(JSON.stringify(rawDataRes));
      let h1 = '<div>Thank you</div>';
      html = html + h1;
      await EmailNotification.sendEmail(html);


      return {
        message: 'success! data inserted sucessfully',
        id: addRatesRes
      };
    } catch (error) {
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


