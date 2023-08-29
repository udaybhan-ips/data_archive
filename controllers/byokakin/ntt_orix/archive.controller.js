var ArchiveNTTORIX = require('../../../models/byokakin/ntt_orix/archive');
var ArchiveNTT = require('../../../models/byokakin/ntt/archive');


const billingMonth = "07";
const billingYear ="2023";
const carrier = 'NTTORIX';

module.exports = {
  

  uploadKotehiNTTORIX: async function (req, res) {
    try {
     
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
      //const deleteTargetDateData = await ArchiveNTTORIX.deleteTargetDateCDR(billingMonth, serviceType, callType);
      //const resNTTORIXFreeDialNumList = await ArchiveNTTORIX.getNTTORIXFreeDialNumList();
      //const resNTTORIXFreeAccountNumList = await ArchiveNTTORIX.getNTTORIXFreeAccountNumList();
      //const resNTTORIXCustomerList = await ArchiveNTTORIX.getNTTORIXCustomerList();

      const resNTTORIXRAWData = await ArchiveNTTORIX.insertNTTORIXRAWData("",billingYear, billingMonth, carrier);
      console.log("NTTORIX RAW CDR Upload Done ...")
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

  async uploadNTTORIXKotehiDataByUI(req, res) {
    
    try {
      const { year, month, comCode } = req.body;

      //console.log("req.."+JSON.stringify(req.body));

      const checkTableExistRes = await ArchiveNTT.checkTableExist(`byokakin_ntt_koteihi_${year}${month}`);
      

      if (!checkTableExistRes) {
          // create table here
          const createTableRes = await ArchiveNTT.createNTTTables(year, month);      
      }
      
      // const checkKotehiData = await ArchiveNTT.checkTargetKotehiData(year, month, 'NTT_ORIX');

      // if(checkKotehiData === 'data is already there') {
      //   return res.status(200).json({
      //     message: checkKotehiData,
      //   });
      // }
   
      const resNTTKotehiData = await ArchiveNTTORIX.insertNTTORIXKotehiDataByAPI(req.body.file_input, "fileName", year, month, 'NTT_ORIX');
      
      const resNTTFreeDialNumList = await ArchiveNTT.getNTTFreeDialNumList();
      const resCustomerList = await ArchiveNTTORIX.getNTTORIXCustomer();
      const resChargeKotehiData = await ArchiveNTTORIX.chargeKotehiData(year, month, resNTTFreeDialNumList, resCustomerList);

       //await ArchiveNTT.insertNTTKotehiDataByAPI(req.body.file_input, 
        // resNTTCustomerList, resNTTFreeDialNumList,resNTTFreeAccountNumList,year, month);
      
        
      console.log("Done ...")
      return res.status(200).json({
        message: 'success! data inserted sucessfully',
      });
    } catch (error) {
      return error;
    }


},

async getUnRegisteredNTTORIXKotehiNumberByUI(req, res) {
  try {
    const { year, month, comCode } = req.body;
    const [checkUnRegistededKotehiNumberRes, checkUnRegistededKotehiNumberErr] = await handleError(ArchiveNTT.checkUnRegistededKotehiNumber(year, month, comCode));
    if (checkUnRegistededKotehiNumberErr) {
      //throw new Error('Could not fetch the summary');
      return res.status(500).json({
        message: checkUnRegistededKotehiNumberErr.message
      });
    }
    return res.status(200).json(checkUnRegistededKotehiNumberRes);

  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
},

async deleteNTTORIXKotehiDataByUI(req, res) {
  try {
    const { year, month, comCode } = req.body;
    const [deleteNTTKotehiDataByUIRes, deleteNTTKotehiDataByUIErr] = await handleError(ArchiveNTT.deleteTargetKotehiData(year, month, 'NTT_ORIX'));
    if (deleteNTTKotehiDataByUIErr) {
      //throw new Error('Could not fetch the summary');
      return res.status(500).json({
        message: deleteNTTKotehiDataByUIErr.message
      });
    }
    return res.status(200).json(deleteNTTKotehiDataByUIRes);

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