
var EmailNotification = require('../../models/kickback/emailNotification');

let internlReport = true;

module.exports = {

  sendEmail: async function (req, res) {
    const dateId = '3';
    try {
      const [Dates, targetDateErr] = await handleError(EmailNotification.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }

      // const [allKickComp, allKickCompErr] = await handleError(EmailNotification.getAllKickComp(Dates.targetDateWithTimezone));

      // if (allKickCompErr) {
      //   throw new Error('Could not all kick company');

      // }

      if(internlReport){

        const [proDataAllRes, proDataAllErr] = await handleError(EmailNotification.getAllProTrafficSummary(Dates.targetDateWithTimezone));
        if (proDataAllErr) {
          throw new Error('error while fetching data processed data');
        }
        const [getSummaryDataMysqlRes, getSummaryDataMysqlErr] = await handleError(EmailNotification.getSummaryDataMysql(Dates.targetDateWithTimezone ));
        if (getSummaryDataMysqlErr) {
          throw new Error('error while inserting data in traffic summary table');
        }

        // const [getSummaryDataRes, getSummaryDataErr] = await handleError(EmailNotification.getSummaryData( Dates.targetDateWithTimezone , allKickComp[i]['customer_cd']));
        // if (getSummaryDataErr) {
        //   throw new Error('error while fetching data processed data');
        // }

        const [createHTMLForAllDataRes, createHTMLForAllDataErr] = await handleError(EmailNotification.createHTMLForAllData(proDataAllRes, getSummaryDataMysqlRes));
        if (createHTMLForAllDataErr) {
          throw new Error('error while creating table');
        }

        const [sendEmailAllDataRes, sendEmailAllDataErr] = await handleError(EmailNotification.sendEmailAllData(createHTMLForAllDataRes));
        if (sendEmailAllDataErr) {
          throw new Error('error while sending email');
        }

      }



      // for (let i = 0; i < allKickComp.length; i++) {

      //   const [deleteTrafficSumm, deleteTrafficSummErr] = await handleError(EmailNotification.deleteTrafficSummary(allKickComp[i]['customer_cd'], Dates.targetDateWithTimezone));
      //   if (deleteTrafficSummErr) {
      //     throw new Error('error while deleting summary data');
      //   }
      //   const [proDataRes, proDataErr] = await handleError(EmailNotification.getTrafficSummary(allKickComp[i]['customer_cd'], Dates.targetDateWithTimezone));
      //   if (proDataErr) {
      //     throw new Error('error while fetching data processed data');
      //   }
      //   const [insertTrafficSummaryRes, insertTrafficSummaryErr] = await handleError(EmailNotification.insertTrafficSummary(proDataRes, allKickComp[i]['customer_cd'], Dates.targetDateWithTimezone ));
      //   if (insertTrafficSummaryErr) {
      //     throw new Error('error while inserting data in traffic summary table');
      //   }

      //   const [getSummaryDataRes, getSummaryDataErr] = await handleError(EmailNotification.getSummaryData( Dates.targetDateWithTimezone , allKickComp[i]['customer_cd']));
      //   if (getSummaryDataErr) {
      //     throw new Error('error while fetching data processed data');
      //   }

      //   const [createTableRes, createTableErr] = await handleError(EmailNotification.createTable(getSummaryDataRes, allKickComp[i]['title_name']));
      //   if (createTableErr) {
      //     throw new Error('error while creating table');
      //   }

      //   const [sendEmailRes, sendEmailErr] = await handleError(EmailNotification.sendEmail(createTableRes, allKickComp[i]));
      //   if (sendEmailErr) {
      //     throw new Error('error while sending email');
      //   }
      // }

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
  sendEmailByApi: async function (req, res) {
    const dateId = '1';
    try {
      const [Dates, targetDateErr] = await handleError(EmailNotification.getTargetDate(dateId));
      if (targetDateErr) {
        return res.status(400).json({
          message: 'Could not fetch target date'
        });
      }

      const [proDataRes, proDataErr] = await handleError(EmailNotification.getSummaryData(Dates.targetDateWithTimezone));
      if (proDataErr) {
        return res.status(400).json({
          message: 'error while fetching data processed data'
        });

      }

      const [rawDataRes, rawDataErr] = await handleError(EmailNotification.getSummaryDataMysql(Dates.targetDateWithTimezone));
      if (rawDataErr) {
        return res.status(400).json({
          message: 'error while fetching raw data'
        });

      }

      const [createTableRes, createTableErr] = await handleError(EmailNotification.createTable(rawDataRes, proDataRes));
      if (createTableErr) {
        return res.status(400).json({
          message: 'error while creating table'
        });

      }

      const [sendEmailRes, sendEmailErr] = await handleError(EmailNotification.sendEmail(createTableRes));
      if (sendEmailErr) {
        return res.status(400).json({
          message: 'error while sending email'
        });

      }

      return res.status(200).json({
        message: 'success! email sent'
      });

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });

    }
  },
}

const handleError = (promise) => {
  return promise
    .then(data => ([data, undefined]))
    .catch(error => Promise.resolve([undefined, error]));
}