var CommissionInfo = require('../../models/commission/commission');
let dateId = 12;
module.exports = {
  
  getData: async function(req, res) {
    try {

        const [Dates,targetDateErr] = await handleError(CommissionInfo.getTargetDate(dateId));
        if(targetDateErr) {
          throw new Error('Could not fetch target date');  
        } 
        
        const billingYear = new Date(Dates.target_billing_month).getFullYear();
        let billingMonth = new Date(Dates.target_billing_month).getMonth() + 1;

        if(parseInt(billingMonth,10)<10){ 
          billingMonth='0'+ billingMonth;
        }

        const [customerListRes,customerListErr] = await handleError(CommissionInfo.getAllCommissionCustomer());
        if(customerListErr) {
          throw new Error('Could not fetch customer list');  
        }

        for(let i=0; i<customerListRes.length;i++){

                    
          const [deleteSummaryRes, deleteSummaryErr] = await handleError(CommissionInfo.deleteCommissionDetails(customerListRes[i]['customer_cd'], billingYear, billingMonth));
          if(deleteSummaryErr) {
            throw new Error('Error while delete summary data '+ deleteSummaryErr);  
          } 

          const [createSummaryRes, createSummaryErr] = await handleError(CommissionInfo.createCommissionDetails( { comp_code:customerListRes[i]['customer_cd'], year:billingYear, month:billingMonth, payment_plan_date:'2024-01-31', createdBy:'system' } ));
          if(createSummaryErr) {
            throw new Error('Error while creating summary data '+ createSummaryErr);  
          }
        
        }
        console.log("done!!")        
    } catch (error) {
      console.log("Error!!"+error.message);
        return {
            message: error
          };
    }    
  },
  getCommissionConfig: async function (req, res) {

    try {
      const [agentCommissionConfigRes, agentCommissionConfigErr] = await handleError(CommissionInfo.getCommissionConfig(req.body));
      if (agentCommissionConfigErr) {

        return res.status(500).json({
          message: agentCommissionConfigErr.message
        });
      }
      return res.status(200).json(agentCommissionConfigRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  deleteCommissionConfig: async function (req, res) {

    try {
      const [deleteCommissionConfigRes, deleteCommissionConfigErr] = await handleError(CommissionInfo.deleteCommissionConfig(req.body));
      if (deleteCommissionConfigErr) {

        return res.status(500).json({
          message: deleteCommissionConfigErr.message
        });
      }
      return res.status(200).json(deleteCommissionConfigRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  addCommissionConfig: async function (req, res) {

    try {
      const [addCommissionConfigRes, addCommissionConfigErr] = await handleError(CommissionInfo.addCommissionConfig(req.body));
      if (addCommissionConfigErr) {
        return res.status(500).json({
          message: addCommissionConfigErr.message
        });
      }
      return res.status(200).json(addCommissionConfigRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  updateCommissionConfig: async function (req, res) {
    console.log("req..." + JSON.stringify(req.body))
    try {
      const [updateCommConfigRes, updateCommConfigErr] = await handleError(CommissionInfo.updateCommissionConfig(req.body));


      if (updateCommConfigErr) {

        return res.status(500).json({
          message: updateCommConfigErr.message
        });
      }
      return res.status(200).json(updateCommConfigRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  getCommissionInfo: async function (req, res) {

    try {
      const [agentCommissionInfoRes, agentCommissionInfoErr] = await handleError(CommissionInfo.getCommissionInfo(req.body));
      if (agentCommissionInfoErr) {

        return res.status(500).json({
          message: agentCommissionInfoErr.message
        });
      }
      return res.status(200).json(agentCommissionInfoRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  createCommissionDetails: async function (req, res) {
    console.log("req.." + JSON.stringify(req.body))
    try {
      const [createCommissionDetailsRes, createCommissionDetailsErr] = await handleError(CommissionInfo.createCommissionDetails(req.body));
      if (createCommissionDetailsErr) {

        return res.status(500).json({
          message: createCommissionDetailsErr.message
        });
      }
      return res.status(200).json(createCommissionDetailsRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  getCommissionDetails: async function (req, res) {

    try {


      const [getCommissionDetailsRes, getCommissionDetailsErr] = await handleError(CommissionInfo.getCommissionDetails(req.body));
      if (getCommissionDetailsErr) {

        return res.status(500).json({
          message: getCommissionDetailsErr.message
        });
      }
      return res.status(200).json(getCommissionDetailsRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },

  getCommissionSummary: async function (req, res) {

    try {
      const [getCommissionSummaryRes, getCommissionSummaryErr] = await handleError(CommissionInfo.getCommissionSummary(req.body));
      if (getCommissionSummaryErr) {

        return res.status(500).json({
          message: getCommissionSummaryErr.message
        });
      }
      return res.status(200).json(getCommissionSummaryRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },
  deleteCommissionInfo: async function (req, res) {

    try {
      const [deleteCommissionSummaryRes, deleteCommissionSummaryErr] = await handleError(CommissionInfo.deleteCommissionSummary(req.body));
      if (deleteCommissionSummaryErr) {

        return res.status(500).json({
          message: deleteCommissionSummaryErr.message
        });
      }
      return res.status(200).json(deleteCommissionSummaryRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },


  updateCommissionInfo: async function (req, res) {
    console.log("req..." + JSON.stringify(req.body))
    try {
      const [updateCommRes, updateCommErr] = await handleError(CommissionInfo.updateCommissionInfo(req.body));


      if (updateCommErr) {

        return res.status(500).json({
          message: updateCommErr.message
        });
      }
      return res.status(200).json(updateCommRes);

    } catch (error) {
      return res.status(400).json({
        message: error.message
      });
    }
  },
  addCommissionInfo: async function (req, res) {

    try {
      const [freeNumListRes, freeNumListErr] = await handleError(CommissionInfo.addCommissionInfo(req.body));
      if (freeNumListErr) {
        return res.status(500).json({
          message: freeNumListErr.message
        });
      }
      return res.status(200).json(freeNumListRes);

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