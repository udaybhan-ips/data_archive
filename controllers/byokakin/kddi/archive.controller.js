var ArchiveKDDI = require('../../../models/byokakin/kddi/archive');



module.exports = {
  uploadKotehiKDDI: async function (req, res) {
    try {
      const billingMonth = "2021-12-01";
      const serviceType = "Kotehi";
      const callType = ['free_number','d_number'];
      const filePath = "C:"
      const fileName ="NTCD202112ATU09118002_00.CSV"

      const deleteTargetDateData = await ArchiveKDDI.deleteTargetDateCDR(billingMonth, serviceType, callType);
      const resKDDIFreeDialNumList = await ArchiveKDDI.getKDDIFreeDialNumList();
      const resKDDIFreeAccountNumList = await ArchiveKDDI.getKDDIFreeAccountNumList();
      const resKDDICustomerList = await ArchiveKDDI.getKDDICustomerList();

      const resKDDIKotehiData = await ArchiveKDDI.insertKDDIKotehiData(filePath, fileName, resKDDICustomerList, resKDDIFreeDialNumList,resKDDIFreeAccountNumList);
      console.log("data");
      console.log(JSON.stringify(resKDDIKotehiData));

      //const getDataRes = await ArchiveKDDI.insertByBatches(resKDDIKotehiData);
 
      return res.status(200).json({
        message: 'success! data inserted sucessfully',

      });
    } catch (error) {
      return error;
    }
  },

  uploadKDDIRAW: async function (req, res) {
    try {
      const billingMonth = "2021-12-01";
      const serviceType = "RAW";
      

      //const deleteTargetDateData = await ArchiveKDDI.deleteTargetDateCDR(billingMonth, serviceType, callType);
      //const resKDDIFreeDialNumList = await ArchiveKDDI.getKDDIFreeDialNumList();
      //const resKDDIFreeAccountNumList = await ArchiveKDDI.getKDDIFreeAccountNumList();
      //const resKDDICustomerList = await ArchiveKDDI.getKDDICustomerList();

      const resKDDIRAWData = await ArchiveKDDI.insertKDDIRAWData();
      //console.log("data");
      //console.log(JSON.stringify(resKDDIKotehiData));

      //const getDataRes = await ArchiveKDDI.insertByBatches(resKDDIKotehiData);
 
      
    } catch (error) {
      console.log(error);
    }
  },


  getProData: async function (req, res) {
    const dateId = 4;
    try {

      const [Dates, targetDateErr] = await handleError(ArchiveKDDI.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }
      // console.log(JSON.stringify(Dates));

      const [tableName, tableNameErr] = await handleError(ArchiveKDDI.getTableName(Dates.targetDate));
      if (tableNameErr) {
        throw new Error('Could not fetch table name');
      }
      

      return res.status(200).json({
        message: 'success! data inserted sucessfully',

      });
    } catch (error) {
      return error;
    }
  },
  async getKDDIKotehiData(req, res) {
    try {
      const [kotehiDataRes, kotehiDataErr] = await handleError(ArchiveKDDI.getKDDIKotehiData(req.body));
      if (kotehiDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: kotehiDataErr.message
        });
      }
      return res.status(200).json(kotehiDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getLastMonthKDDIKotehiData(req, res) {
    try {
      const [kotehiLastMonthDataRes, kotehiLastMonthDataErr] = await handleError(ArchiveKDDI.getLastMonthKDDIKotehiData(req.body));
      if (kotehiLastMonthDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: kotehiLastMonthDataErr.message
        });
      }
      return res.status(200).json(kotehiLastMonthDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getKDDIKotehiLastMonthData(req, res) {
    try {
      const [kotehiDataRes, kotehiDataErr] = await handleError(ArchiveKDDI.getKDDIKotehiLastMonthData(req.body));
      if (kotehiDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: archiveErr.message
        });
      }
      return res.status(200).json(kotehiDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getKDDIKotehiABasciData(req, res) {
    try {
      const [getKDDIKotehiABasciDataRes, getKDDIKotehiABasciDataErr] = await handleError(ArchiveKDDI.getKDDIKotehiABasciData(req.body));
      if (getKDDIKotehiABasciDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getKDDIKotehiABasciDataErr.message
        });
      }
      return res.status(200).json(getKDDIKotehiABasciDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getKDDIKotehiAServiceDataData(req, res) {
    try {
      const [getKDDIKotehiAServiceDataDataRes, getKDDIKotehiAServiceDataDataErr] = await handleError(ArchiveKDDI.getKDDIKotehiAServiceDataData(req.body));
      if (getKDDIKotehiAServiceDataDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getKDDIKotehiAServiceDataDataErr.message
        });
      }
      return res.status(200).json(getKDDIKotehiAServiceDataDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async updateArchiveDate(req, res) {
    try {
      if (req.body.date_id && req.body.targetDate) {

        const getUpdateRes = await ArchiveKDDI.updateBatchControl(req.body.date_id, req.body.targetDate, api = true);
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