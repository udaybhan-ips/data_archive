var ArchiveKDDI = require('../../../models/byokakin/kddi/archive');



module.exports = {

  uploadKotehiKDDI: async function (req, res) {
    try {
      

      //console.log("req.."+JSON.stringify(req));

      const billingMonth = "07";
      const billingYear ="2023";
      const serviceType = "Kotehi";
      const callType = ['free_number','d_number'];
      const filePath = "C:"
      const fileName ="" ;

      const checkTableExistRes = await ArchiveKDDI.checkTableExist(`byokakin_kddi_infinidata_${billingYear}${billingMonth}`);
        
  
      if (!checkTableExistRes) {
          // create table here
          const createTableRes = await ArchiveKDDI.createKDDITables(billingYear, billingMonth);      
      }

      //const deleteTargetDateData = await ArchiveKDDI.deleteTargetDateCDR(billingYear, billingMonth, serviceType, callType);
      const resKDDIFreeDialNumList = await ArchiveKDDI.getKDDIFreeDialNumList();
      const resKDDIFreeAccountNumList = await ArchiveKDDI.getKDDIFreeAccountNumList();
      const resKDDICustomerList = await ArchiveKDDI.getKDDICustomerList();

      const resKDDIKotehiData = await ArchiveKDDI.insertKDDIKotehiData(filePath, fileName, 
        resKDDICustomerList, resKDDIFreeDialNumList,resKDDIFreeAccountNumList,billingYear, billingMonth);
      //console.log("data");
     // console.log(JSON.stringify(resKDDIKotehiData));

      //const getDataRes = await ArchiveKDDI.insertByBatches(resKDDIKotehiData);
      console.log("Done ...")
      return res.status(200).json({
        message: 'success! data inserted sucessfully',

      });
    } catch (error) {
      return error;
    }
  },

  uploadKDDIRAW: async function (req, res) {
    try {
      const billingMonth = "10";
      const billingYear ="2023";
      const serviceType = "RAW";
      

      //const deleteTargetDateData = await ArchiveKDDI.deleteTargetDateCDR(billingMonth, serviceType, callType);
      //const resKDDIFreeDialNumList = await ArchiveKDDI.getKDDIFreeDialNumList();
      //const resKDDIFreeAccountNumList = await ArchiveKDDI.getKDDIFreeAccountNumList();
      //const resKDDICustomerList = await ArchiveKDDI.getKDDICustomerList();

      const resKDDIRAWData = await ArchiveKDDI.insertKDDIRAWData("",billingYear, billingMonth);
      //console.log("data");
      //console.log(JSON.stringify(resKDDIKotehiData));

      //const getDataRes = await ArchiveKDDI.insertByBatches(resKDDIKotehiData);
 
      
    } catch (error) {
      console.log(error);
    }
  },

  async getKDDIFreeAccountNumListDetails(req, res) {
    try {
      const [getKDDIFreeAccountNumListRes, getKDDIFreeAccountNumListErr] = await handleError(ArchiveKDDI.getKDDIFreeAccountNumList(req.body));
      if (getKDDIFreeAccountNumListErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getKDDIFreeAccountNumListErr.message
        });
      }
      return res.status(200).json(getKDDIFreeAccountNumListRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getKDDIFreeDialNumListDetails(req, res) {
    try {
      const [getKDDIFreeDialNumListRes, getKDDIFreeDialNumListErr] = await handleError(ArchiveKDDI.getKDDIFreeDialNumList(req.body));
      if (getKDDIFreeDialNumListErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getKDDIFreeDialNumListErr.message
        });
      }
      return res.status(200).json(getKDDIFreeDialNumListRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
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

  async getUnRegisteredKDDIKotehiNumberByUI(req, res) {
    try {
      const { year, month, comCode } = req.body;
      const [checkUnRegistededKotehiNumberRes, checkUnRegistededKotehiNumberErr] = await handleError(ArchiveKDDI.checkUnRegistededKotehiNumber(year, month, comCode));
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
  

  async uploadKDDIKotehiDataByUI(req, res) {
    
      try {
        const { year, month, comCode } = req.body;
  
        //console.log("req.."+JSON.stringify(req.body));

        const checkTableExistRes = await ArchiveKDDI.checkTableExist(`byokakin_kddi_infinidata_${year}${month}`);
        
  
        if (!checkTableExistRes) {
            // create table here
            const createTableRes = await ArchiveKDDI.createKDDITables(year, month);      
        }
        
        const checkKotehiData = await ArchiveKDDI.checkTargetKotehiData(year, month);

        if(checkKotehiData === 'data is already there') {
          return res.status(200).json({
            message: checkKotehiData,
          });
        }
        
        const resKDDIFreeDialNumList = await ArchiveKDDI.getKDDIFreeDialNumList();
        const resKDDIFreeAccountNumList = await ArchiveKDDI.getKDDIFreeAccountNumList();
        const resKDDICustomerList = await ArchiveKDDI.getKDDICustomerList();

         await ArchiveKDDI.insertKDDIKotehiDataByAPI(req.body.file_input, 
           resKDDICustomerList, resKDDIFreeDialNumList,resKDDIFreeAccountNumList,year, month);
        
          
        console.log("Done ...")
        return res.status(200).json({
          message: 'success! data inserted sucessfully',
        });
      } catch (error) {
        return error;
      }
  
  
  },

  

  async deleteKDDIKotehiDataByUI(req, res) {
    try {
      const { year, month, comCode } = req.body;
      const [deleteKDDIKotehiDataByUIRes, deleteKDDIKotehiDataByUIErr] = await handleError(ArchiveKDDI.deleteTargetKotehiData(year, month, comCode));
      if (deleteKDDIKotehiDataByUIErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: deleteKDDIKotehiDataByUIErr.message
        });
      }
      return res.status(200).json(deleteKDDIKotehiDataByUIRes);

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

  

  async deleteKotehiProcessedData(req, res) {
    try {
      console.log("req.body.."+JSON.stringify(req.body))
      const [deleteKotehiProcessedDataRes, deleteKotehiProcessedDataErr] = await handleError(ArchiveKDDI.deleteKotehiProcessedData(req.body));

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

  async addKotehiData(req, res) {

    
    if(!req.body){
      return res.status(500).json({
        message: 'req data is empty'
      });
    }

    
    try {
      const [addKotehiDataRes, addKotehiDataErr] = await handleError(ArchiveKDDI.addKotehiData(req.body));

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
  

  

  async getKDDIKotehiProcessedData(req, res) {
    try {
      const [getKDDIKotehiProcessedDataRes, getKDDIKotehiProcessedDataErr] = await handleError(ArchiveKDDI.getKDDIKotehiProcessedData(req.body));
      if (getKDDIKotehiProcessedDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getKDDIKotehiProcessedDataErr.message
        });
      }
      return res.status(200).json(getKDDIKotehiProcessedDataRes);

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

  async getAdditionalKotehiData(req, res) {
    try {
      const [getAdditionalKotehiDataRes, getAdditionalKotehiDataErr] = await handleError(ArchiveKDDI.getAdditionalKotehiData(req.body));
      if (getAdditionalKotehiDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getAdditionalKotehiDataErr.message
        });
      }
      return res.status(200).json(getAdditionalKotehiDataRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },
  

  async getKDDICustomer(req, res) {
    try {
      const [getKDDICustomerRes, getKDDICustomerErr] = await handleError(ArchiveKDDI.getKDDICustomer(req.body));
      if (getKDDICustomerErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getKDDICustomerErr.message
        });
      }
      return res.status(200).json(getKDDICustomerRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  async getKDDIKotehiABasciServiceData(req, res) {
    try {
      const [getKDDIKotehiABasciServiceDataRes, getKDDIKotehiABasciServiceDataErr] = await handleError(ArchiveKDDI.getKDDIKotehiABasicServiceData(req.body));
      if (getKDDIKotehiABasciServiceDataErr) {
        //throw new Error('Could not fetch the summary');
        return res.status(500).json({
          message: getKDDIKotehiABasciServiceDataErr.message
        });
      }
      return res.status(200).json(getKDDIKotehiABasciServiceDataRes);

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