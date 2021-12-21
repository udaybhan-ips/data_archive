const { Pool, Client } = require('pg')
var config = {
    user: 'ips', 
    database: 'ibs', 
    password: '', 
    host: '10.168.22.40', 
    port: 5432, 
    max: 10, // max number of clients in the pool
    idleTimeoutMillis: 30000
};
const client = new Client({
    user: 'ips',
    host: '10.168.22.40',
    database: 'ibs',
    password: 'ips12345',
    port: 5432,
  })
  client.connect()

  console.log("1");
  client.query('SELECT NOW()', (err, res) => {
    console.log("2");
    console.log(err, res)
    client.end()
  })