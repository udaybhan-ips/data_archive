var db = require('../../config/database');
var utility= require('../../public/javascripts/utility');
const {execute} = require('@getvim/execute');

module.exports = {
    startDBbackupDaily: async function() {
        try {
            execute(`pg_dump -U postgres -d byokakin_backup -f /tmp/byokakin_backup.tar -F t`,).then(async () => {
                console.log("Finito");
            }).catch(err => {
                console.log("error in dumping..."+JSON.stringify(err));
            })
        } catch (error) {
            console.log("error in db backup..."+error.message)
            return error;
        }
    },    
}


