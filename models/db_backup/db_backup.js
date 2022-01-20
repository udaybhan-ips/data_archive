var db = require('../../config/database');
var utility= require('../../public/javascripts/utility');
const { PostgreSql } = require('@shagital/db-dumper');

module.exports = {
    startDBbackupDaily: async function() {
        try {
            PostgreSql.create()
            .setDbName('byokakin_backup')
            .setUserName('ips')
            .setPassword('ips12345')
            .setCallback(()=>{
                console.log("Done!")
            })
            .dumpToFile('./dump.sql');
            
        } catch (error) {
            console.log("error in db backup..."+error.message)
            return error;
        }
    },    
}


