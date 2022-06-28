var CDRByokakin = require('../../../models/byokakin/ntt/cdr');

const fs = require('fs');
const { format } = require('@fast-csv/format');
const fileName = 'randoms.csv';
const csvFile = fs.createWriteStream(fileName);

let CDRHeader = {
  'cdrclassification': '通話区分', 'customercode': '会社コード番号', 'terminaltype': '端末','free_dial': 'FREE DIAL番号', 'calling_number': '通信元電話番号', 'call_date': '通話日',
  'calltime': '通話開始時間', 'callduration': '通話時間（秒)', 'cld_number': '通話先番号',
  'sourcearea': '発信元地域名', 'call_distance': '発信先地域名', 'destination': '通話距離(KM)',
  'call_rate': '料金単位', 'final_call_charge': '通話料金額(¥)', 'callcount104': '案内番号(104)通話回数'
};


module.exports = {

  getCDRPath: async function(req, res) {
    return { message: 'data',
            id: ''
      }
  },
createTmpCDR: async function() {
  
  const stream = format({ headers:true });
  stream.pipe(csvFile);
  stream.write({'通話区分': 'row1-col1', header2: 'row1-発信先地域名' });
  stream.write({ '通話区分': 'row2-col1', header2: '発信先地域名-col2' });
  stream.write({ '通話区分': 'row3-col1', header2: '発信先地域名-col2' });
  stream.write({ '通話区分': 'row4-col1', header2: 'row4-発信先地域名' });
  stream.end();

}
  ,
  

  createCDR: async function(req, res) {

  try{
    // const [Dates,targetDateErr] = await handleError(CDRByokakin.getTargetDate(dateId));
    // if(targetDateErr) {
    //   throw new Error('Could not fetch target date');  
    // } 
    
    // const billingYear = new Date(Dates.target_billing_month).getFullYear();
    // let billingMonth = new Date(Dates.target_billing_month).getMonth() + 1;

    // if(parseInt(billingMonth,10)<10){
    //   billingMonth='0'+billingMonth;
    // }

    const [customerListRes,customerListErr] = await handleError(CDRByokakin.getNTTCompList());
    if(customerListErr) {
      throw new Error('Could not fetch customer list');  
    }

    console.log("customer list=="+JSON.stringify(customerListRes));

    for(let i=0; i<customerListRes.length;i++){
      
      const [createCDRRes, createCDRErr] = await handleError(CDRByokakin.createCDR('NTT',
      customerListRes[i]['customer_name'], customerListRes[i]['customer_code'], '2022', '04'));
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