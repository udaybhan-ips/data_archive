var ArchiveNTTORIX = require('../../../models/byokakin/ntt_orix/archive');
module.exports = {

  uploadKotehiNTTORIX: async function (req, res) {
    try {
      const billingMonth = "03";
      const billingYear ="2022";
      
      const carrier = 'NTTORIX';

      console.log("here")
      const resNTTORIXKotehiData = await ArchiveNTTORIX.insertNTTORIXKotehiData("filePath", "fileName", billingYear, billingMonth, carrier);
      console.log("Done ...")
      // return res.status(200).json({
      //   message: 'success! data inserted sucessfully',

      // });
    } catch (error) {
      return error;
    }
  },

  NTTORIXKotehiCharge: async function(req, res){

    try{
      const billingMonth = "03";
      const billingYear ="2022";
      
      const resNTTORIXFreeDialNumList = await ArchiveNTTORIX.getNTTORIXFreeDialNumList();
      const resCustomerList = await ArchiveNTTORIX.getCustomerList();

      const resChargeKotehiData = await ArchiveNTTORIX.chargeKotehiData(billingYear, billingMonth, resNTTORIXFreeDialNumList, resCustomerList);

      console.log("NTTORIX Kotehi Charge Done ...")

    }catch(err){
      console.log("Error is "+err);
      
    }

  },


  uploadNTTORIXRAW: async function (req, res) {
    try {
      const billingMonth = "04";
      const billingYear ="2022";
      const carrier = 'NTTORIXORIX';
      //const deleteTargetDateData = await ArchiveNTTORIX.deleteTargetDateCDR(billingMonth, serviceType, callType);
      //const resNTTORIXFreeDialNumList = await ArchiveNTTORIX.getNTTORIXFreeDialNumList();
      //const resNTTORIXFreeAccountNumList = await ArchiveNTTORIX.getNTTORIXFreeAccountNumList();
      //const resNTTORIXCustomerList = await ArchiveNTTORIX.getNTTORIXCustomerList();

      const resNTTORIXRAWData = await ArchiveNTTORIX.insertNTTORIXRAWData("",billingYear, billingMonth, carrier);
      //console.log("data");
      //console.log(JSON.stringify(resNTTORIXKotehiData));

      //const getDataRes = await ArchiveNTTORIX.insertByBatches(resNTTORIXKotehiData);
 
      
    } catch (error) {
      console.log(error);
    }
  },

  async getNTTORIXFreeAccountNumListDetails(req, res) {
    try {
      const [getNTTORIXFreeAccountNumListRes, getNTTORIXFreeAccountNumListErr] = await handleError(ArchiveNTTORIX.getNTTORIXFreeAccountNumList(req.body));
      if (getNTTORIXFreeAccountNumListErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTORIXFreeAccountNumListErr.message
        });
      }
      return res.status(200).json(getNTTORIXFreeAccountNumListRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getNTTORIXFreeDialNumListDetails(req, res) {
    try {
      const [getNTTORIXFreeDialNumListRes, getNTTORIXFreeDialNumListErr] = await handleError(ArchiveNTTORIX.getNTTORIXFreeDialNumList(req.body));
      if (getNTTORIXFreeDialNumListErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTORIXFreeDialNumListErr.message
        });
      }
      return res.status(200).json(getNTTORIXFreeDialNumListRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  getProData: async function (req, res) {
    const dateId = 4;
    try {

      const [Dates, targetDateErr] = await handleError(ArchiveNTTORIX.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }
      // console.log(JSON.stringify(Dates));

      const [tableName, tableNameErr] = await handleError(ArchiveNTTORIX.getTableName(Dates.targetDate));
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
  async getNTTORIXKotehiData(req, res) {
    try {
      const [kotehiDataRes, kotehiDataErr] = await handleError(ArchiveNTTORIX.getNTTORIXKotehiData(req.body));
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

  async getNTTORIXKotehiLastMonthData(req, res) {
    try {
      const [kotehiLastMonthDataRes, kotehiLastMonthDataErr] = await handleError(ArchiveNTTORIX.getNTTORIXKotehiLastMonthData(req.body));
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

  

  async deleteKotehiProcessedData(req, res) {
    try {
      const [deleteKotehiProcessedDataRes, deleteKotehiProcessedDataErr] = await handleError(ArchiveNTTORIX.deleteKotehiProcessedData(req.body));
      if (deleteKotehiProcessedDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: deleteKotehiProcessedDataErr.message
        });
      }
      return res.status(200).json({'deleted_rows':deleteKotehiProcessedDataRes.rowCount});

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getNTTORIXKotehiLastMonthProcessedData(req, res) {
    try {
      const [kotehiDataRes, kotehiDataErr] = await handleError(ArchiveNTTORIX.getNTTORIXKotehiLastMonthProcessedData(req.body));
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

  async addKotehiData(req, res) {

    console.log("testing..")
    if(!req.body){
      return res.status(500).json({
        message: 'req data is empty'
      });
    }

    
    try {
      const [addKotehiDataRes, addKotehiDataErr] = await handleError(ArchiveNTTORIX.addKotehiData(req.body));

      if (addKotehiDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: addKotehiDataErr.message
        });
      }
      return res.status(200).json(addKotehiDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },
  

  

  async getNTTORIXKotehiProcessedData(req, res) {
    console.log("testing")
    try {
      const [getNTTORIXKotehiProcessedDataRes, getNTTORIXKotehiProcessedDataErr] = await handleError(ArchiveNTTORIX.getNTTORIXKotehiProcessedData(req.body));
      if (getNTTORIXKotehiProcessedDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTORIXKotehiProcessedDataErr.message
        });
      }
      return res.status(200).json(getNTTORIXKotehiProcessedDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getNTTORIXKotehiABasciData(req, res) {
    try {
      const [getNTTORIXKotehiABasciDataRes, getNTTORIXKotehiABasciDataErr] = await handleError(ArchiveNTTORIX.getNTTORIXKotehiABasciData(req.body));
      if (getNTTORIXKotehiABasciDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTORIXKotehiABasciDataErr.message
        });
      }
      return res.status(200).json(getNTTORIXKotehiABasciDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getNTTORIXCustomer(req, res) {
    try {
      const [getNTTORIXCustomerRes, getNTTORIXCustomerErr] = await handleError(ArchiveNTTORIX.getNTTORIXCustomer(req.body));
      if (getNTTORIXCustomerErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTORIXCustomerErr.message
        });
      }
      return res.status(200).json(getNTTORIXCustomerRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getNTTORIXKotehiABasciServiceData(req, res) {
    try {
      const [getNTTORIXKotehiABasciServiceDataRes, getNTTORIXKotehiABasciServiceDataErr] = await handleError(ArchiveNTTORIX.getNTTORIXKotehiABasicServiceData(req.body));
      if (getNTTORIXKotehiABasciServiceDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTORIXKotehiABasciServiceDataErr.message
        });
      }
      return res.status(200).json(getNTTORIXKotehiABasciServiceDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getNTTORIXKotehiServiceData(req, res) {
    try {
      const [getNTTORIXKotehiServiceDataRes, getNTTORIXKotehiServiceDataErr] = await handleError(ArchiveNTTORIX.getNTTORIXKotehiServiceData(req.body));
      if (getNTTORIXKotehiServiceDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTORIXKotehiServiceDataErr.message
        });
      }
      return res.status(200).json(getNTTORIXKotehiServiceDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async updateArchiveDate(req, res) {
    try {
      if (req.body.date_id && req.body.targetDate) {

        const getUpdateRes = await ArchiveNTTORIX.updateBatchControl(req.body.date_id, req.body.targetDate, api = true);
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