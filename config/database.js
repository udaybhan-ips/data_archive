var Promise = require('promise');
var config = require('./config');
const {Pool} = require('pg');
var mysql =require('mysql');
var connectionString = config.DATABASE_URL;
const mySQLConnectionString=config.MYSQL_DATABASE_URL;
module.exports = {
  query: async function(text, values) {
    console.log("query="+text+"----"+values);
       try{
         const pool = await new Pool({connectionString})
         const res = await pool.query(text,values);
         return (res);
       }catch(err){
          console.error("Error while quering" +err)
          return handleErrorMessages(err);
       }

      },
      mySQLQuery: function(text, values) {
        //console.log("mysql connection string is=  "+mySQLConnectionString.MYSQL);
        console.log("query="+text+"----"+values);
        const connection=mysql.createConnection({
          host     : '192.168.11.252',
          user     : 'ips',
          password : 'ips0032',
          database : 'epart'
        });
        connection.connect();

        return new Promise(function(resolve, reject) {
            connection.query(text, function(err, result) {
              if (err) {
                handleErrorMessages(err)
                  .then(function(message) {
                    reject(message);
                  })
                  .catch(function() {
                    reject();
                  });
              }
              else {
                resolve(result);
              }
            });
          });
      }
};


// module.exports = {
 
// };


function handleErrorMessages(err) {
  return new Promise(function(resolve, reject) {
    if (err.code == '23505') {
      err = 'email already in use, please use a different one'
    }
    if (err.code == '22P02') {
      err = 'invalid user UUID'
    }
    else if (process.env.NODE_ENV !== 'development') {
      err = 'something went wrong, please check your input and try again'
    }
    resolve(err);
  });
}