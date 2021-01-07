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

//const data = '[{"trunk_port":"IPSG33KFE3PRI2,IPSGEE4P1DPRI2","customer_name":"GeekFeed","customer_id":"101"},{"trunk_port":"IPSFUJ150FPRI2","customer_name":"FUJI Soft","customer_id":"102"},{"trunk_port":"IPSYAM42C5PRI2","customer_name":"YAMATO CONTACT SERVICE","customer_id":"103"},{"trunk_port":"IPS50UNDGUPRI2","customer_name":"SOUNDS GOOD","customer_id":"104"},{"trunk_port":"IPSCLO0P3NPRI2","customer_name":"CLOOPEN","customer_id":"105"},{"trunk_port":"IPSW1ZKLN6PRI2,IPSW1ZN3W4PRI2","customer_name":"WIZ","customer_id":"106"},{"trunk_port":"IPSMVN0S1RPRII","customer_name":"GINZA LIFE","customer_id":"107"},{"trunk_port":"IPSNTTM44CPRI2","customer_name":"NTT MARKETING ACT","customer_id":"108"},{"trunk_port":"IPSG3ND41XPRI2","customer_name":"Gendai_Tsushin","customer_id":"109"},{"trunk_port":"IPSGRE3N45PRI2","customer_name":"Green House","customer_id":"110"},{"trunk_port":"IPSTRY34LVPRI2","customer_name":"TRYBAL_UNIT","customer_id":"111"}]';
