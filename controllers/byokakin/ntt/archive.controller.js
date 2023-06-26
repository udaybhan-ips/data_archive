var ArchiveNTT = require('../../../models/byokakin/ntt/archive');
const billingMonth = "05";
const billingYear ="2023";
const carrier = 'NTT';

module.exports = {

  uploadKotehiNTT: async function (req, res) {
    try {
     
      console.log("here")
      const resNTTKotehiData = await ArchiveNTT.insertNTTKotehiData("filePath", "fileName", billingYear, billingMonth, carrier);
      console.log("Done ...")
      // return res.status(200).json({
      //   message: 'success! data inserted sucessfully',

      // });
    } catch (error) {
      return error;
    }
  },

  NTTKotehiCharge: async function(req, res){

    try{
      
      
      const resNTTFreeDialNumList = await ArchiveNTT.getNTTFreeDialNumList();
      const resCustomerList = await ArchiveNTT.getNTTCustomer();

      const resChargeKotehiData = await ArchiveNTT.chargeKotehiData(billingYear, billingMonth, resNTTFreeDialNumList, resCustomerList);

      console.log("NTT Kotehi Charge Done ...")

    }catch(err){
      console.log("Error is "+err);      
    }

  },


  uploadNTTRAW: async function (req, res) {
    try {

 
      //const deleteTargetDateData = await ArchiveNTT.deleteTargetDateCDR(billingMonth, serviceType, callType);
      //const resNTTFreeDialNumList = await ArchiveNTT.getNTTFreeDialNumList();
      //const resNTTFreeAccountNumList = await ArchiveNTT.getNTTFreeAccountNumList();
      //const resNTTCustomerList = await ArchiveNTT.getNTTCustomerList();

      const resNTTRAWData = await ArchiveNTT.insertNTTRAWData("",billingYear, billingMonth, carrier);
      //console.log("data");
      //console.log(JSON.stringify(resNTTKotehiData));

      //const getDataRes = await ArchiveNTT.insertByBatches(resNTTKotehiData);
 
      
    } catch (error) {
      console.log(error);
    }
  },



  async uploadNTTKotehiDataByUI(req, res) {
    
    try {
      const { year, month, comCode } = req.body;

      //console.log("req.."+JSON.stringify(req.body));

      const checkTableExistRes = await ArchiveNTT.checkTableExist(`byokakin_ntt_koteihi_${year}${month}`);
      

      if (!checkTableExistRes) {
          // create table here
          const createTableRes = await ArchiveNTT.createNTTTables(year, month);      
      }
      
      const checkKotehiData = await ArchiveNTT.checkTargetKotehiData(year, month);

      if(checkKotehiData === 'data is already there') {
        return res.status(200).json({
          message: checkKotehiData,
        });
      }
   
      const resNTTKotehiData = await ArchiveNTT.insertNTTKotehiDataByAPI(req.body.file_input, "fileName", year, month, 'NTT');
      
      const resNTTFreeDialNumList = await ArchiveNTT.getNTTFreeDialNumList();
      const resCustomerList = await ArchiveNTT.getNTTCustomer();
      const resChargeKotehiData = await ArchiveNTT.chargeKotehiData(year, month, resNTTFreeDialNumList, resCustomerList);

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

async getUnRegisteredNTTKotehiNumberByUI(req, res) {
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

async deleteNTTKotehiDataByUI(req, res) {
  try {
    const { year, month, comCode } = req.body;
    const [deleteNTTKotehiDataByUIRes, deleteNTTKotehiDataByUIErr] = await handleError(ArchiveNTT.deleteTargetKotehiData(year, month, comCode));
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

  async getNTTFreeAccountNumListDetails(req, res) {
    try {
      const [getNTTFreeAccountNumListRes, getNTTFreeAccountNumListErr] = await handleError(ArchiveNTT.getNTTFreeAccountNumList(req.body));
      if (getNTTFreeAccountNumListErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTFreeAccountNumListErr.message
        });
      }
      return res.status(200).json(getNTTFreeAccountNumListRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },
  

  async getNTT_N_NumList(req, res) {
    try {
      const [getNTT_N_NumListRes, getNTT_N_NumListErr] = await handleError(ArchiveNTT.getNTT_N_NumList(req.body));
      if (getNTT_N_NumListErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTT_N_NumListErr.message
        });
      }
      return res.status(200).json(getNTT_N_NumListRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },


  async getNTTFreeDialNumListDetails(req, res) {
    try {
      const [getNTTFreeDialNumListRes, getNTTFreeDialNumListErr] = await handleError(ArchiveNTT.getNTTFreeDialNumList(req.body));
      if (getNTTFreeDialNumListErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTFreeDialNumListErr.message
        });
      }
      return res.status(200).json(getNTTFreeDialNumListRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  getProData: async function (req, res) {
    const dateId = 4;
    try {

      const [Dates, targetDateErr] = await handleError(ArchiveNTT.getTargetDate(dateId));
      if (targetDateErr) {
        throw new Error('Could not fetch target date');
      }
      // console.log(JSON.stringify(Dates));

      const [tableName, tableNameErr] = await handleError(ArchiveNTT.getTableName(Dates.targetDate));
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
  async getNTTKotehiData(req, res) {
    try {
      const [kotehiDataRes, kotehiDataErr] = await handleError(ArchiveNTT.getNTTKotehiData(req.body));
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

  async getNTTKotehiLastMonthData(req, res) {
    try {
      const [kotehiLastMonthDataRes, kotehiLastMonthDataErr] = await handleError(ArchiveNTT.getNTTKotehiLastMonthData(req.body));
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
      const [deleteKotehiProcessedDataRes, deleteKotehiProcessedDataErr] = await handleError(ArchiveNTT.deleteKotehiProcessedData(req.body));
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

  async getNTTKotehiLastMonthProcessedData(req, res) {
    try {
      const [kotehiDataRes, kotehiDataErr] = await handleError(ArchiveNTT.getNTTKotehiLastMonthProcessedData(req.body));
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
      const [addKotehiDataRes, addKotehiDataErr] = await handleError(ArchiveNTT.addKotehiData(req.body));

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
  

  

  async getNTTKotehiProcessedData(req, res) {
    console.log("testing")
    try {
      const [getNTTKotehiProcessedDataRes, getNTTKotehiProcessedDataErr] = await handleError(ArchiveNTT.getNTTKotehiProcessedData(req.body));
      if (getNTTKotehiProcessedDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTKotehiProcessedDataErr.message
        });
      }
      return res.status(200).json(getNTTKotehiProcessedDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getNTTKotehiABasciData(req, res) {
    try {
      const [getNTTKotehiABasciDataRes, getNTTKotehiABasciDataErr] = await handleError(ArchiveNTT.getNTTKotehiABasciData(req.body));
      if (getNTTKotehiABasciDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTKotehiABasciDataErr.message
        });
      }
      return res.status(200).json(getNTTKotehiABasciDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getNTTCustomer(req, res) {
    try {
      const [getNTTCustomerRes, getNTTCustomerErr] = await handleError(ArchiveNTT.getNTTCustomer(req.body));
      if (getNTTCustomerErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTCustomerErr.message
        });
      }
      return res.status(200).json(getNTTCustomerRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getNTTKotehiABasciServiceData(req, res) {
    try {
      const [getNTTKotehiABasciServiceDataRes, getNTTKotehiABasciServiceDataErr] = await handleError(ArchiveNTT.getNTTKotehiABasicServiceData(req.body));
      if (getNTTKotehiABasciServiceDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTKotehiABasciServiceDataErr.message
        });
      }
      return res.status(200).json(getNTTKotehiABasciServiceDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getNTTKotehiServiceData(req, res) {
    try {
      const [getNTTKotehiServiceDataRes, getNTTKotehiServiceDataErr] = await handleError(ArchiveNTT.getNTTKotehiServiceData(req.body));
      if (getNTTKotehiServiceDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getNTTKotehiServiceDataErr.message
        });
      }
      return res.status(200).json(getNTTKotehiServiceDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async updateArchiveDate(req, res) {
    try {
      if (req.body.date_id && req.body.targetDate) {

        const getUpdateRes = await ArchiveNTT.updateBatchControl(req.body.date_id, req.body.targetDate, api = true);
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