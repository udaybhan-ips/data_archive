var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '192.168.11.252',
  user     : 'ips',
  password : 'ips0032',
  database : 'epart'
});
 
connection.connect();
 
connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});