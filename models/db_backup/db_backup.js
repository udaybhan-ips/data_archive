var db = require('../../config/database');
var utility= require('../../public/javascripts/utility');
const {execute} = require('@getvim/execute');
const { exec } = require('child_process');

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

            exec(`pg_dump -U postgres -d ${dbname} -f ${currentFileNamePath} -F t`, (err, stdout, stderr) => {
                if (err) {
                  console.error(err)
                } else {
                 console.log(`stdout: ${stdout}`);
                 console.log(`stderr: ${stderr}`);
                }
              });

            
            // // execute(`pg_dump -U postgres -d ${dbname} -f ${currentYYYY_MM_DD} -F t`,).then(async () => {
            // //     console.log("dumping of data base finished")

            // //     execute(`rm -rf ${twoDaysBeforeFileNamePath}`,)
            // //     .then(async ()=>{
            // //         let subject = `LS36 IPSビリングBilling DB BACKUP of ${dbname}` 
            // //         let html = `<div> 
            // //         <h3> This is notification of db back of ${dbname} done</h3>
            // //         </div> `;
            // //         let mailOption = {
            // //             from: 'ips_tech@sysmail.ipsism.co.jp',
            // //             to: 'uday@ipsism.co.jp',
            // //             cc: 'y_ito@ipsism.co.jp',
            // //             subject,
            // //             html
            // //         }
            // //         utility.sendEmail(mailOption);

            // //         return `dumping of database and deleting of old file finished`;

            // //     })
            // //     .catch(err=>{
            // //         console.log("err in deleting old file.."+JSON.stringify(err))
            // //         return new Error(err);
            // //     })

                
            // }).catch(err => {
            //     console.log("error in dumping..."+JSON.stringify(err));
            //     return new Error(err)
            // })
        } catch (error) {
            console.log("error in db backup..."+error.message)
            return new Error(error);
        }
    },    
}



