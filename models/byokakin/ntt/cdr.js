var db = require('../../../config/database');
var utility = require('../../../public/javascripts/utility');

module.exports = {
    getNTTCompList: async function () {
        try {
          const query = `select   m_cus.id  as id , m_cus.customer_cd as customer_code, m_cus.customer_name as customer_name from 
          (select id, customer_cd, customer_name, address, staff_name from  m_customer where is_deleted=false)
          as m_cus join (select * from ntt_customer where deleted=false) 
          as ntt_cus on ( m_cus.customer_cd::int = ntt_cus.customer_code::int) 
          and m_cus.customer_cd ='00000901' order by m_cus.customer_cd desc   `;
          // const query = `select id, customer_code from kddi_customer where customer_code::int= '516' and deleted = false  order by customer_code::int `;
          const getNTTCompListRes = await db.query(query, [], true);
    
          if (getNTTCompListRes.rows) {
            return (getNTTCompListRes.rows);
          }
          return { err: 'not found' };
        } catch (error) {
          console.log("err in get kddi comp list =" + error.message);
          return error;
        }
      },

    createCDR: async function (carrierName, customer_name, customer_id, year, month) {
        
        console.log("customer name=" + customer_name, customer_id);

        console.log("year==" + year, month);
        let CDRHeader = [
            {id:'cdrclassification',title: '通話区分'},{ id:'customercode',title: '会社コード番号'},{ id:'terminaltype',title:'端末'},
            {id:'free_dial',title: 'FREE DIAL番号'},{id:'calling_number',title:'通信元電話番号'},{id:'call_date',title:'通話日'},
            {id:'calltime',title:'通話開始時間'},{id:'callduration',title: '通話時間（秒)'}, {id:'cld_number',title: '通話先番号'}, 
            {id:'sourcearea',title: '発信元地域名'}, {id:'call_distance',title: '発信先地域名'}, {id:'destination',title: '通話距離(KM)'},
            {id:'call_rate',title: '料金単位'}, {id:'final_call_charge',title: '通話料金額(¥)'}, {id:'callcount104',title: '案内番号(104)通話回数'}];
        try {
           
          

                 let fileName = __dirname + `\\CDR\\${carrierName}\\${customer_id}${year}${month}.csv`;

                let query = `select  CDRCLASSIFICATION as 通話区分 , CUSTOMERCODE , TERMINALTYPE as 端末, REPLACE(FREEDIALNUMBER, '-','') as free_dial ,
                REPLACE(CALLINGNUMBER,'-','') as calling_number , CALLDATE as call_date , CALLTIME, CALLDURATION , REPLACE(CLD,'-','') as cld_number ,
                SOURCEAREA, CASE WHEN TERMINALTYPE!='携帯'  then (case when CDRCLASSIFICATION='INBOUND'
                then (select  distance from locationvsdistance where location=SOURCEAREA limit 1 )
                else (select  distance from locationvsdistance where location=DESTINATIONAREA limit 1 )  end) else '0' end as call_distance ,
                CASE WHEN TERMINALTYPE = 'その他 - 税込み' THEN '' ELSE DESTINATIONAREA END as destination,
                 CASE WHEN TERMINALTYPE = 'その他 - 税込み' THEN '0' ELSE CALLRATE END as call_rate ,
                 FINALCALLCHARGE as final_call_charge ,CALLCOUNT104
                 from byokakin_ntt_processedcdr_${year}${month}  where TERMINALTYPE!='その他' and customercode = '${customer_id}'  limit 10; `;

                console.log("cdr query=" + query);
                console.log("file name=="+fileName);

              let   resDataArr = await db.cdrDownloadQuery(query,fileName, CDRHeader, customer_name );
                let rows ;
                if(resDataArr && resDataArr.rows){
                    rows = resDataArr.rows;
                }
                
                //console.log(JSON.stringify(rows));

                

           //     utility.createCSVWithWriter(fileName, null , rows);
       


        } catch (err) {
            console.log("Error in creating CDR ==" + err.message);
        }
        console.log("done")
    },

}


