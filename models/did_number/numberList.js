var db = require('../../config/database');

module.exports = {
    getDIDNumberList: async function({_03_numbers, comp_code}) {

        try {
         let where  = " WHERE ";
         console.log("did_numbers.."+_03_numbers)
         console.log("did_numbers.."+comp_code)

          if((comp_code =='' || comp_code ==undefined ) &&  (_03_numbers =='' || _03_numbers == undefined)) {
            throw new Error ('Invalid serach request');
         }

         if(comp_code){
            where += `customer_cd = '${comp_code}' AND`;
         }

         if(_03_numbers){

            let didNumberArr = _03_numbers.split(",");
            let DIDNumbers = "";
            let length = didNumberArr.length -1 ;
            didNumberArr.forEach((e, index)=>{
                if(length == index ){
                    DIDNumbers += `'${e.trim()}'`; 
                }else{
                    DIDNumbers += `'${e.trim()}',`; 
                }            
            })
            where += ` _03_numbers in  (${DIDNumbers}) `;
         }



         let lastThree = where.slice(where.length - 3);

         if(lastThree === 'AND') {
            where = where.substring(0, where.length-3)
         }
         
          const query=`select * from _03numbers ${where} `;

        //  console.log("query.."+query)

          const summaryRes= await db.queryIBS(query,[]);
          
          if(summaryRes.rows){
              return (summaryRes.rows);              
          }
          throw new Error('not found')

      } catch (error) {
            console.log("error in getting did  number list"+error.message)
            throw new Error(error.message)
      }
  },

  updateDIDNumberList: async function({param, ids, updatedBy, remark}) {

    try {
        //console.log("data.."+ JSON.stringify(data))
        if(param.customer_cd == undefined || param.customer_cd == '' || ids.length <=0 ){
            throw new Error('Invalid request');
        }

      const query=`update _03numbers set customer_cd='${param.customer_cd}', modi_name='${updatedBy}', 
      date_update='${param.date_update}', stop_date='${param.stop_date}' where id in (${ids.toString()}) `;
      const summaryRes= await db.queryIBS(query,[]);
      
      if(summaryRes.rows){
          return (summaryRes.rows);              
      }
      throw new Error('not found')

  } catch (error) {
        console.log("error in getting did number list"+error.message)
        throw new Error(error.message)
  }
},

addDIDNumberList: async function(data) {

    try {
        console.log("data.."+ JSON.stringify(data))
        if(data.comp_code == undefined || data.comp_code == '' || data._03_numbers == undefined || data._03_numbers == ''){
            throw new Error('Invalid request');
        }

        let didNumberArr = data._03_numbers.split(",");
        let DIDNumbers = "";
        let where  = " WHERE ";
        let length = didNumberArr.length -1 ;
        didNumberArr.forEach((e, index)=>{
            if(length == index ){
                DIDNumbers += `'${e.trim()}'`; 
            }else{
                DIDNumbers += `'${e.trim()}',`; 
            }            
        })
        
        where += ` _03_numbers in  (${DIDNumbers}) `;
        

        const searchQuery = `select * from _03numbers ${where}`;
        console.log("searchQuery.."+ (searchQuery))

        const searchRes = await db.queryIBS(searchQuery);
        if(searchRes && searchRes.rows && searchRes.rows.length >0){
            throw  new Error("This number already there... Please go search page!")
        }


        let insertQuery = "";
        let res = [];

        for(let i= 0; i< didNumberArr.length; i++){
            insertQuery = `insert into _03numbers (customer_cd, _03_numbers, rico_name, 
                start_date, issue_date, valid_flag) Values 
                ('${data.comp_code}','${didNumberArr[i]}', '${data.updatedBy}','${data.start_date}',now(), 0) returning id`;
            
            const insertRes = await db.queryIBS(insertQuery,[]);      
              
            if(insertRes && insertRes.rows && insertRes.rows.length>0){
               res.push(insertRes.rows[0].id)
            }                
        }

        return res;

  } catch (error) {
        console.log("error in getting did number list"+error.message)
        throw new Error(error.message)
  }
},
 
  
}


