var CDRByokakin = require('../../../models/byokakin/kddi/cdr');
let dateId=3
module.exports = {

  getCDRPath: async function(req, res) {
    return { message: 'data',
            id: ''
      }
  },

  createCDR: async function(req, res) {

  try{
    const [Dates,targetDateErr] = await handleError(CDRByokakin.getTargetDate(dateId));
    if(targetDateErr) {
      throw new Error('Could not fetch target date');  
    } 
    
    const billingYear = new Date(Dates.target_billing_month).getFullYear();
    let billingMonth = new Date(Dates.target_billing_month).getMonth() + 1;

    if(parseInt(billingMonth,10)<10){
      billingMonth='0'+billingMonth;
    }

    const [customerListRes,customerListErr] = await handleError(CDRByokakin.getAllByokakinCustomer(dateId));
    if(customerListErr) {
      throw new Error('Could not fetch customer list');  
    }

    console.log("customer list=="+JSON.stringify(customerListRes));

    for(let i=0; i<customerListRes.length;i++){
      
      const [createCDRRes, createCDRErr] = await handleError(CDRByokakin.createCDR(customerListRes[i]['cdr_comp_name'], customerListRes[i]['customer_id'], billingYear, billingMonth));
      if(createCDRErr) {
        throw new Error('Error while creating cdr '+ createCDRErr.message);  
      }
    
    }
     
    
    // return {
    //     message: 'success! data inserted sucessfully',
    //    // id: addRatesRes
    //   };
} catch (error) {
  console.log("Error!!"+error.message);
    return {
        message: error
      };
}   
  },
  
  async getByokakinCustomerList(req, res){
    try {
        const getByokakinCustListRes = await CDRByokakin.getAllByokakinCustomer();
        return res.status(200).json(getByokakinCustListRes);
      
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