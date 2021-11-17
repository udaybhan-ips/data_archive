var ArchiveMVNO = require('../../models/mvno/archive');

module.exports = {
  getData: async function (req, res) {
    const dateId = '5';
    try {

      const [Dates, targetDateErr] = await handleError(ArchiveMVNO.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }
       console.log(JSON.stringify(Dates));

      const deleteTargetDateData = await ArchiveMVNO.deleteTargetDateCDR(Dates.targetDateWithTimezone);
      let getTargetCDRRes = await ArchiveMVNO.getTargetCDR(Dates.targetDateWithTimezone);
      const getDataRes = await ArchiveMVNO.insertByBatches(getTargetCDRRes);


      const [udpateBatchControlRes, updateBatchControlErr] = await handleError(ArchiveMVNO.updateBatchControl(dateId, Dates.targetDate));
      if (updateBatchControlErr) {
        throw new Error('Err: while updating target date');
      }

      return udpateBatchControlRes.status(200).json({
        message: 'success! data inserted sucessfully',
        id: addRatesRes
      });
    } catch (error) {
      return error;
    }
  },
  getDataFPhoneALeg: async function (req, res) {
    const dateId = '6';
    const customer_id = '10000707';
    try {

      const [Dates, targetDateErr] = await handleError(ArchiveMVNO.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }
       console.log(JSON.stringify(Dates));

      const deleteTargetDateData = await ArchiveMVNO.deleteTargetDateCDRFPhone(Dates.targetDate, 'A',customer_id);
      let getTargetCDRRes = await ArchiveMVNO.getTargetCDRFPhone(Dates.targetDateWithTimezone, 'A',customer_id);
      let getFPhoneRatesRes = await ArchiveMVNO.getFPhoneRates();
      
      const getDataRes = await ArchiveMVNO.insertByBatchesFPhone(getTargetCDRRes, 'A',getFPhoneRatesRes,'','','',customer_id);


      const [udpateBatchControlRes, updateBatchControlErr] = await handleError(ArchiveMVNO.updateBatchControl(dateId, Dates.targetDate));
      if (updateBatchControlErr) {
        throw new Error('Err: while updating target date');
      }

      return udpateBatchControlRes.status(200).json({
        message: 'success! data inserted sucessfully',
        id: addRatesRes
      });
    } catch (error) {
      return error;
    }
  },
  getDataFPhoneBLeg: async function (req, res) {
    const dateId = '7';
    const customer_id = '10000707';
    try {

      const [Dates, targetDateErr] = await handleError(ArchiveMVNO.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }
       console.log(JSON.stringify(Dates));

      const deleteTargetDateData = await ArchiveMVNO.deleteTargetDateCDRFPhone(Dates.targetDate, 'B',customer_id);
      let getTargetCDRRes = await ArchiveMVNO.getTargetCDRFPhone(Dates.targetDateWithTimezone, 'B',customer_id);
      let getFPhoneRatesRes = await ArchiveMVNO.getFPhoneRates();
      let getFPhoneCarrierChageRes = await ArchiveMVNO.getFPhoneCarrierChage();
      let getFPhoneRelayCarrierRes = await ArchiveMVNO.getFPhoneRelayCarrier();
      let getFPhoneTermUse = await ArchiveMVNO.getFPhoneTermUse();

      const getDataRes = await ArchiveMVNO.insertByBatchesFPhone(getTargetCDRRes, 'B', getFPhoneRatesRes, getFPhoneCarrierChageRes,getFPhoneRelayCarrierRes,getFPhoneTermUse,customer_id);


      const [udpateBatchControlRes, updateBatchControlErr] = await handleError(ArchiveMVNO.updateBatchControl(dateId, Dates.targetDate));
      if (updateBatchControlErr) {
        throw new Error('Err: while updating target date');
      }

      return udpateBatchControlRes.status(200).json({
        message: 'success! data inserted sucessfully',
        id: addRatesRes
      });
    } catch (error) {
      return error;
    }
  },

  getDataFPhoneALegXMOBILE: async function (req, res) {
    const dateId = '8';
    const customer_id = '00000707';
    try {

      const [Dates, targetDateErr] = await handleError(ArchiveMVNO.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }
       console.log(JSON.stringify(Dates));

      const deleteTargetDateData = await ArchiveMVNO.deleteTargetDateCDRFPhoneXMOBILE(Dates.targetDate, 'A',customer_id);
      let getTargetCDRRes = await ArchiveMVNO.getTargetCDRFPhoneXMOBILE(Dates.targetDateWithTimezone, 'A',customer_id);
      let getFPhoneRatesRes = await ArchiveMVNO.getFPhoneRates();
      
      const getDataRes = await ArchiveMVNO.insertByBatchesFPhone(getTargetCDRRes, 'A',getFPhoneRatesRes,'','','',customer_id);


      const [udpateBatchControlRes, updateBatchControlErr] = await handleError(ArchiveMVNO.updateBatchControl(dateId, Dates.targetDate));
      if (updateBatchControlErr) {
        throw new Error('Err: while updating target date');
      }

      return udpateBatchControlRes.status(200).json({
        message: 'success! data inserted sucessfully',
        id: addRatesRes
      });
    } catch (error) {
      return error;
    }
  },


  async reprocessByCustomerId(req, res) {
    try {
      if (req.body.customerId && req.body.customerName) {

        const Dates = await ArchiveMVNO.getTargetDate(dateId);
        const deleteTargetDateData = await ArchiveMVNO.deleteTargetDateCDR(Dates.targetDate, req.body.customerId, req.body.customerName);

        const getAllTrunkgroupRes = await ArchiveMVNO.getAllTrunkgroup(req.body.customerId, req.body.customerName);
        const getRatesRes = await ArchiveMVNO.getRates(req.body.customerId, req.body.customerName);

        //  console.log(JSON.stringify(getAllTrunkgroupRes));

        let getTargetCDRRes = await ArchiveMVNO.getTargetCDRBYID(Dates.targetDateWithTimezone, getAllTrunkgroupRes[0]);
        const getDataRes = await ArchiveMVNO.insertByBatches(getTargetCDRRes, getAllTrunkgroupRes, getRatesRes);
        const [udpateBatchControlRes, updateBatchControlErr] = await handleError(ArchiveMVNO.updateBatchControl(dateId, Dates.targetDate));

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

  async getArchiveStatus(req, res) {
    try {
      const [archiveRes, archiveErr] = await handleError(ArchiveMVNO.getTargetDate(dateId));
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
  async getMVNOCustomerList(req, res) {
    try {
      const getMVNOCustListRes = await ArchiveMVNO.getMVNOCustomerList();
      return res.status(200).json(getMVNOCustListRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async updateArchiveDate(req, res) {
    try {
      if (req.body.date_id && req.body.targetDate) {

        const getUpdateRes = await ArchiveMVNO.updateBatchControl(req.body.date_id, req.body.targetDate, api = true);


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