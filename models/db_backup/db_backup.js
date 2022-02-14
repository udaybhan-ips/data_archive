var db = require('../../config/database');
var utility= require('../../public/javascripts/utility');
const {execute} = require('@getvim/execute');



module.exports = {
    startDBbackupDaily: async function() {
        try {
            let dbname= 'byokakin_backup';
            let currentYYYY_MM_DD = utility.getCurrentDayMonthYear(); 
            let date = new Date()
            let twoDaysBeforeYYYY_MM_DD = utility.getCurrentDayMonthYear(new Date (date.setDate(date.getDate() - 2))); 
            
            console.log("currentYYYY_MM_DD.."+currentYYYY_MM_DD);
            console.log("twoDaysBeforeYYYY_MM_DD.."+twoDaysBeforeYYYY_MM_DD);
            let currentFileNamePath = `/mnt/db_backup/${currentYYYY_MM_DD}.tar`;
            let twoDaysBeforeFileNamePath = `/mnt/db_backup/${twoDaysBeforeYYYY_MM_DD}.tar`;

            execute(`pg_dump -U postgres -d ${dbname} -t ${tableName} -f ${currentYYYY_MM_DD} -F t `,).then(async () => {
                console.log("dumping of data base finished")

                execute(`rm -rf ${twoDaysBeforeFileNamePath}`,)
                .then(async ()=>{
                    let subject = `LS36 IPSビリングBilling DB BACKUP of ${dbname}` 
                    let html = `<div> 
                    <h3> This is notification of db back of ${dbname} done</h3>
                    </div> `;
                    let mailOption = {
                        from: 'ips_tech@sysmail.ipsism.co.jp',
                        to: 'uday@ipsism.co.jp',
                        cc: 'y_ito@ipsism.co.jp',
                        subject,
                        html
                    }
                    utility.sendEmail(mailOption);

                    return `dumping of database and deleting of old file finished`;

                })
                .catch(err=>{
                    console.log("err in deleting old file.."+JSON.stringify(err))
                    return new Error(err);
                })

                
            }).catch(err => {
                console.log("error in dumping..."+JSON.stringify(err));
                return new Error(err)
            })
        } catch (error) {
            console.log("error in db backup..."+error.message)
            return new Error(error);
        }
    },

    
    getTargetDate: async function (date_id) {
        try {
          const query = `SELECT date_id , date_set::date + interval '1' day as next_run_time  ,  (date_set)::date + interval '0 HOURS' as target_date , (date_set)::date - interval '9 HOURS'  as target_date_with_timezone FROM batch_date_control where date_id=${date_id} and deleted=false limit 1`;
          const targetDateRes = await db.query(query, []);
          // console.log(targetDateRes);
          if (targetDateRes.rows) {
            return { 'id': (targetDateRes.rows[0].date_id), 'next_run_time': (targetDateRes.rows[0].next_run_time), 'targetDate': (targetDateRes.rows[0].target_date), 'targetDateWithTimezone': (targetDateRes.rows[0].target_date_with_timezone) };
          }
          return { err: 'not found' };
        } catch (error) {
          return error;
        }
      },
      getTableName: async function (targetDate) {
        try {
          const year = new Date(targetDate).getFullYear();
          let month = new Date(targetDate).getMonth() + 1;
    
          if (parseInt(month, 10) < 10) {
            month = '0' + month;
          }
          return `cdr_${year}${month}`;
    
        } catch (e) {
          console.log("err in get table=" + e.message);
          return console.error(e);
        }
      },    

      cdrSonusDBbackupDaily: async function(db_name, tableName) {
        try {
            
            let currentYYYY_MM_DD = utility.getCurrentDayMonthYear(); 
            let date = new Date()
            let twoDaysBeforeYYYY_MM_DD = utility.getCurrentDayMonthYear(new Date (date.setDate(date.getDate() - 2))); 
            
            console.log("currentYYYY_MM_DD.."+currentYYYY_MM_DD);
            console.log("twoDaysBeforeYYYY_MM_DD.."+twoDaysBeforeYYYY_MM_DD);
            let currentFileNamePath = `/mnt/db_backup/${tableName}_${currentYYYY_MM_DD}.sql`;
            let twoDaysBeforeFileNamePath = `/mnt/db_backup/${tableName}${twoDaysBeforeYYYY_MM_DD}.sql`;


            console.log("currentFileNamePath.."+currentFileNamePath);
            console.log("twoDaysBeforeFileNamePath.."+twoDaysBeforeFileNamePath);


            execute(`pg_dump -U postgres -d ${db_name} -t ${tableName} -f ${currentFileNamePath}  `,).then(async () => {
                console.log("dumping of data base finished")

                execute(`rm -rf ${twoDaysBeforeFileNamePath}`,)
                .then(async ()=>{
                    let subject = `LS36 IPSビリングBilling DB BACKUP of ${dbname}` 
                    let html = `<div> 
                    <h3> This is notification of db back of ${dbname} done</h3>
                    </div> `;
                    let mailOption = {
                        from: 'ips_tech@sysmail.ipsism.co.jp',
                        to: 'uday@ipsism.co.jp',
                      //  cc: 'y_ito@ipsism.co.jp',
                        subject,
                        html
                    }
                    utility.sendEmail(mailOption);

                    return `dumping of database and deleting of old file finished`;

                })
                .catch(err=>{
                    console.log("err in deleting old file.."+JSON.stringify(err))
                    return new Error(err);
                })

                
            }).catch(err => {
                console.log("error in dumping..."+JSON.stringify(err));
                return new Error(err)
            })
        } catch (error) {
            console.log("error in db backup..."+error.message)
            return new Error(error);
        }
    },
}



