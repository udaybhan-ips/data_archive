var db = require('../../config/database');

module.exports = {
    getInvoiceData: async function() {
      try {
          return {'message':'success','path':'\\ws35\国内通信\通信事業部\NewBillingSystem\Leafnet'};
          
      } catch (error) {
          return error;
      }
  },
 
  
}


