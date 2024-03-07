var ArchiveKickback = require('../../models/kickback/archive');


module.exports = {

  getNewData: async function (req, res) {
    const dateId = 13;
    try {

      //getting new sonus migration data 

      const [Dates, targetDateErr] = await handleError(ArchiveKickback.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }
      const getTargetBillableNewCDRRes = await ArchiveKickback.getTargetNewCDR(Dates.targetDate);
      const getDataBillabeRes = await ArchiveKickback.insertByBatches(getTargetBillableNewCDRRes, null, null, null, null, 'new_migration_data','cdr_202402_new');

      const [updateBatchControlRes, updateBatchControlErr] = await handleError(ArchiveKickback.updateBatchControl(dateId, Dates.targetDate));
      if (updateBatchControlErr) {
        throw new Error('Err: while updating target date');
      }

      return res.status(200).json({
        message: 'success! data inserted sucessfully',

      });
    } catch (error) {
      return error;
    }
  },
  getData: async function (req, res) {
    const dateId = '3';
    try {

      const [Dates, targetDateErr] = await handleError(ArchiveKickback.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }
      // console.log(JSON.stringify(Dates));

      const [tableName, tableNameErr] = await handleError(ArchiveKickback.getTableName(Dates.targetDate));
      if (tableNameErr) {
        throw new Error('Could not fetch table name');
      }
      // console.log("table name=="+(tableNameRes));

      const checkTableExistRes = await ArchiveKickback.checkTableExist(tableName);
      const targetDay = new Date(Dates.targetDate).getDate();

      if (!checkTableExistRes) {
        if (targetDay == 1) {
          // create table here
          const checkTableExistRes = await ArchiveKickback.createTable(tableName);
        } else {
          //send email there is issue
          const sendErrorEmail = await ArchiveKickback.sendErrorEmail(tableName, Dates.targetDate);
          return ("Please check the batch control table and table name..! Table must be created!")
        }
      }

      const deleteTargetDateData = await ArchiveKickback.deleteTargetDateCDR(Dates.targetDate, tableName);
      const getTargetCDRRes = await ArchiveKickback.getTargetCDR(Dates.targetDateWithTimezone, tableName);
      const getCompanyCodeInfoRes = await ArchiveKickback.getCompanyCodeInfo(Dates.targetDateWithTimezone);
      const getRemoteControlNumberDataRes = await ArchiveKickback.getRemoteControlNumberData(Dates.targetDateWithTimezone);

      const getDataRes = await ArchiveKickback.insertByBatches(getTargetCDRRes, getCompanyCodeInfoRes, getRemoteControlNumberDataRes, null, null, 'raw_cdr', tableName);

      const [updateBatchControlRes, updateBatchControlErr] = await handleError(ArchiveKickback.updateBatchControl(dateId, Dates.targetDate));
      if (updateBatchControlErr) {
        throw new Error('Err: while updating target date');
      }

      return res.status(200).json({
        message: 'success! data inserted sucessfully',

      });
    } catch (error) {
      return error;
    }
  },
  getProData: async function (req, res) {
    const dateId = 4;
    try {

      const [Dates, targetDateErr] = await handleError(ArchiveKickback.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }
      // console.log(JSON.stringify(Dates));

      const [tableName, tableNameErr] = await handleError(ArchiveKickback.getTableName(Dates.targetDate));
      if (tableNameErr) {
        throw new Error('Could not fetch table name');
      }

      const [tableNameBillCDR, tableNameBillCDRErr] = await handleError(ArchiveKickback.getTableName(Dates.targetDate, 'billcdr'));
      if (tableNameBillCDRErr) {
        throw new Error('Could not fetch bill cdr table name');
      }

      // console.log("table name=="+(tableNameRes));


      const checkTableExistRes = await ArchiveKickback.checkTableExist(tableNameBillCDR, 'ibs');
      const targetDay = new Date(Dates.targetDate).getDate();

      if (!checkTableExistRes) {
        if (targetDay == 1) {
          // create table here
          const checkTableExistRes = await ArchiveKickback.createTableBillCDR(tableNameBillCDR);
        } else {
          //send email there is issue
          const sendErrorEmail = await ArchiveKickback.sendErrorEmail(tableNameBillCDR, Dates.targetDate);
          return ("Please check the batch control table and table name..! Table must be created!")
        }
      }


      /***** for billcdr main ******/

      const deleteTargetDateBillableData = await ArchiveKickback.deleteTargetBillableCDR(Dates.targetDate, tableNameBillCDR);
      const getTargetBillableCDRRes = await ArchiveKickback.getTargetBillableCDR(Dates.targetDate, tableName);
      const getCarrierInfoRes = await ArchiveKickback.getKickCompanyInfo();
      const getTerminalUseInfoRes = await ArchiveKickback.getTerminalUseInfo();
      const getDataBillabeRes = await ArchiveKickback.insertByBatches(getTargetBillableCDRRes, null, null, getCarrierInfoRes, getTerminalUseInfoRes, 'bill_cdr', tableNameBillCDR);

      const [updateBatchControlRes, updateBatchControlErr] = await handleError(ArchiveKickback.updateBatchControl(dateId, Dates.targetDate));
      if (updateBatchControlErr) {
        throw new Error('Err: while updating target date');
      }

      return res.status(200).json({
        message: 'success! data inserted sucessfully',

      });
    } catch (error) {
      return error;
    }
  },
  async getArchiveStatus(req, res) {
    try {
      const [archiveRes, archiveErr] = await handleError(ArchiveKickback.getTargetDate(dateId));
      if (archiveErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: archiveErr.message
        });
      }
      return res.status(200).json([archiveRes]);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },


  async updateArchiveDate(req, res) {
    try {
      if (req.body.date_id && req.body.targetDate) {

        const getUpdateRes = await ArchiveKickback.updateBatchControl(req.body.date_id, req.body.targetDate, api = true);


        return res.status(200).json([{ id: 0, result: 'success', message: 'done' }]);
      } else {
        return res.status(400).json({ result: 'fail', message: 'process date missing' });
      }


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