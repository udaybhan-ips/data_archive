var db = require('../../config/database');

module.exports = {
    getCommissionInfo: async function(data) {

        try {
          const query=`select data_idno as id, agent_code, freedial_code as target_agent_code, serv_name, 
          call_sort as call_type, edat_star as start_date, edat_fini as end_date, amnt_conv as commisson,
         edit_by, edit_date  from agent_incentive where edat_fini::date > now()  order by agent_code` ;

        //  console.log("query.."+query)

          const summaryRes= await db.queryByokakin(query,[]);
          
          if(summaryRes.rows){
              return (summaryRes.rows);              
          }
          throw new Error('not found')

      } catch (error) {
            console.log("error in getting commission info !"+error.message)
            throw new Error(error.message)
      }
  },
  deleteCommissionSummary: async function(data) {

    console.log("data..."+JSON.stringify(data))

    

    try {
      const query=`delete from agent_commission where bill_numb ='${data.bill_numb}' ` ;
      const queryDetail=`delete from agent_commission_details where bill_numb ='${data.bill_numb}' ` ;

    //  console.log("query.."+query)

      const deleteRes= await db.queryByokakin(query,[]);
      const deleteDetatilRes= await db.queryByokakin(queryDetail,[]);
      
      if(deleteRes && deleteDetatilRes){
          return (deleteRes);              
      }
      throw new Error('not found')

  } catch (error) {
        console.log("error in delete commission data !"+error.message)
        throw new Error(error.message)
  }
},

  getCommissionSummary: async function({year, month, comp_code}) {

    try {

      if(year == undefined || year == '' || year == null || month == undefined || month == '' || month ==null){
        throw new Error('Invalid Request!')
      }

      let where = `WHERE bill_start::date ='${year}-${month}-1' and bill_sum > 0`;

      if(comp_code !=undefined && comp_code !='' && comp_code !=null){
        where += `AND agent_code='${comp_code}'`; 
      }

      

      const query=` select * from agent_commission ${where}  ` ;

    //  console.log("query.."+query)

      const summaryRes= await db.queryByokakin(query,[]);
      
      if(summaryRes.rows){
          return (summaryRes.rows);              
      }
      throw new Error('not found')

  } catch (error) {
        console.log("error in getting commission details !"+error.message)
        throw new Error(error.message)
  }
},

  getCommissionDetails: async function({year, month, comp_code, carrier}) {

    try {

      if(year == undefined || year == '' || year == null || month == undefined || month == '' || month ==null){
        throw new Error('Invalid Request!')
      }

      let where = `WHERE bill_start::date ='${year}-${month}-1' and comm_amnt > 0 `;

      if(comp_code !=undefined && comp_code !='' && comp_code !=null){
        where += `AND agent_code='${comp_code}'`; 
      }

      if(carrier !=undefined && carrier !='' && carrier !=null){
        where += `AND serv_name='${carrier}'`; 
      }

      const query=`select data_idno as id, agent_code, freedial_code, bill_numb, serv_name, call_sort, 
      bill_start, bill_end, bill_amnt, amnt_conv, comm_amnt from agent_commission_details ${where} ` ;

    //  console.log("query.."+query)

      const summaryRes= await db.queryByokakin(query,[]);
      
      if(summaryRes.rows){
          return (summaryRes.rows);              
      }
      throw new Error('not found')

  } catch (error) {
        console.log("error in getting commission details !"+error.message)
        throw new Error(error.message)
  }
},

  createCommissionDetails: async function({comp_code, year, month,  createdBy}) {

    try {

        if(comp_code == undefined || comp_code =='' ){
            throw new Error('Invalid Request')
        }

      const query=` select * from agent_incentive where agent_code='${comp_code}' and 
      edat_fini::date > now() order by freedial_code`;
      const targetAgentCode = await db.queryByokakin(query, []);

      if(targetAgentCode && targetAgentCode.rows && targetAgentCode.rows.length > 0 ){
        let res = [], subTotalCommissionAmt = 0, totalCommissionAmt = 0, taxCommissionAmt = 0 ;

        for(let i=0; i < targetAgentCode.rows.length; i++) {
            let getCommissionData = `select count(*), SUM(FINALCALLCHARGE) as TOTAL_AMOUNT from 
            byokakin_${targetAgentCode.rows[i].serv_name}_processedcdr_${year}${month} where terminaltype= '${targetAgentCode.rows[i].call_sort}' 
            and customercode='${targetAgentCode.rows[i].freedial_code}'`;

            const getCommissionDataRes = await db.queryByokakin(getCommissionData, []);

            if(getCommissionDataRes && getCommissionDataRes.rows && getCommissionDataRes.rows.length>0){
                let commissionAmt = 0, total_amount = 0;
                if(getCommissionDataRes.rows[0].total_amount!=null){
                    commissionAmt = getCommissionDataRes.rows[0].total_amount*targetAgentCode.rows[i].amnt_conv;
                    total_amount = getCommissionDataRes.rows[0].total_amount;
                    subTotalCommissionAmt +=  parseInt(commissionAmt,10);
                }                
                const insertQuery = `insert into agent_commission_details (agent_code, freedial_code, bill_numb, serv_name, call_sort, 
                bill_start, bill_end, bill_amnt, amnt_conv, comm_amnt) VALUES ('${comp_code}','${targetAgentCode.rows[i].freedial_code}',
                'bill_numb','${targetAgentCode.rows[i].serv_name}','${targetAgentCode.rows[i].call_sort}','${year}-${month}-01','${year}-${month}-30','${total_amount}',
                '${targetAgentCode.rows[i].amnt_conv}','${commissionAmt}')`;
                 const insertRes = await db.queryByokakin(insertQuery, []);
                 res.push(insertRes);
                 if(res =='data already there!'){
                    throw new Error(res)
                 }

            }           
        }

        if(subTotalCommissionAmt>0){
            taxCommissionAmt =  subTotalCommissionAmt*.1;
            totalCommissionAmt = subTotalCommissionAmt + taxCommissionAmt;
        }

        const insertSummaryData = `insert into agent_commission (agent_code, bill_numb, bill_coun, amount_use,advbefore_pay,advnow_pay,
            total_bill, bill_start, bill_end, bill_issue, bill_due, bill_sum, bill_disc, bill_tax,   bill_total, reco_date, 
            reco_name, modi_date, modi_name, paid_flag, paidprocessby, paidprocessdate , serv_name) VALUES ('${comp_code}','bill_numb','0',
            '${totalCommissionAmt}',0,0,'${totalCommissionAmt}','${year}-${month}-01','${year}-${month}-30', now(),'${year}-${month}-30',
             '${subTotalCommissionAmt}',0,'${taxCommissionAmt}', '${totalCommissionAmt}', now(),'${createdBy}', now(),'${createdBy}',
             null, null, null, 'NTT-KDDI')`;

        const sumRes = await db.queryByokakin(insertSummaryData, []);

      }else{
        throw new Error('No commission register!')
      }
  } catch (error) {
        console.log("error in getting commission info !"+error.message)
        throw new Error(error.message)
  }
},
  

  updateCommissionInfo: async function(param) {

    try {
        console.log("data.."+ JSON.stringify(param))
        let carrier_amount =0 , ips_amount = 0 ; 
        if(param.carrier_amount !==null && param.carrier_amount !== undefined && param.carrier_amount !=='' ){
            carrier_amount = param.carrier_amount;
        }
        
        if(param.ips_amount !== null && param.ips_amount !== undefined && param.ips_amount !==''){
            ips_amount = param.ips_amount;
        }
        
      const query=`update ntt_kddi_additional_kotehi_detail set carrier_amount='${carrier_amount}', ips_amount='${ips_amount}', 
      modified_by='${param.updatedBy}', modified_date=now() , deleted=${param.deleted} where id = ${param.id} `;

      const summaryRes= await db.queryByokakin(query,[]);
      
      if(summaryRes.rows){
          return (summaryRes.rows);              
      }
      throw new Error('not found')

  } catch (error) {
        console.log("error in getting adding updating kotehi info.."+error.message)
        throw new Error(error.message)
  }
},

addAddiKotehiInfo: async function(data) {

    try {

    
        console.log("data here.."+ JSON.stringify(data))

        if(data.comp_code == undefined || data.comp_code == '' ||  data.carrier == '' || data.carrier == undefined){
            throw new Error('Invalid request');
        }

        let d_fd_n_number = data.d_fd_n_number.trim();
        let carrier_amount =0 , ips_amount = 0 ; 
        
        if(data.carrier_amount !==null && data.carrier_amount !== undefined && data.carrier_amount !=='' ){
            carrier_amount = data.carrier_amount;
        }
        
        if(data.ips_amount !== null && data.ips_amount !== undefined && data.ips_amount !==''){
            ips_amount = data.ips_amount;
        }

        const searchQuery = `select * from ntt_kddi_additional_kotehi_detail where 
        d_fd_n_number = '${d_fd_n_number}' and product_name='${data.product_name.trim()}' 
        and carrier='${data.carrier}' and customer_cd= '${data.comp_code}' and deleted = false`;
        console.log("searchQuery.."+ (searchQuery))

        const searchRes = await db.queryByokakin(searchQuery);
        if(searchRes && searchRes.rows && searchRes.rows.length >0){
            throw  new Error("This number number already there, so you can update that number!!")
        }


        const insertQuery = `insert into ntt_kddi_additional_kotehi_detail (customer_cd, customer_name, carrier, d_fd_n_number, 
                 stop_date, added_by, date_added, modified_by, modified_date, product_name, carrier_amount, ips_amount) Values 
                ('${data.comp_code}','${data.compName}','${data.carrier}','${d_fd_n_number}', 
                '3000-01-01','${data.added_by}',now(), '${data.modified_by}', now(), '${data.product_name.trim()}', ${carrier_amount}, ${ips_amount} ) returning id`;
            
        const insertRes = await db.queryByokakin(insertQuery,[]);      
    
        return insertRes.rowCount;

  } catch (error) {
        console.log("error in getting adding additional kotehi info..."+error.message)
        throw new Error(error.message)
  }
},
 
  
}


