const e = require('express');
var Promise = require('promise');
var db = require('./../../config/database');

module.exports = {
  findAll: function() {
    return new Promise(function(resolve, reject) {
      db.query('select id, customer_cd, customer_name, address, staff_name from  m_customer where is_deleted=false order by customer_cd desc ', [],ipsPortal=true)
        .then(function(results) {
          resolve(results.rows);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },

  findOne: function(data) {
    return new Promise(function(resolve, reject) {
      if (!data.id && !data.customer_code) {
        reject('error: must provide id or customer code')
      }
      else {
        if (data.id) {
          findOneById(data.id)
            .then(function(result) {
              resolve(result);
            })
            .catch(function(err) {
              reject(err);
            });
        }
        else if (data.customer_code) {
          findOneByCustomerCode(data.customer_code)
            .then(function(result) {
              resolve(result);
            })
            .catch(function(err) {
              reject(err);
            });
        }
      }
    });
  },

  create: function(data) {
    //console.log(data);
    return new Promise(function(resolve, reject) {
      
      validateUserData(data)
        .then(function(hash) {      
          genrateCustomerCode()
          .then(function(customer_cd){
            if(!customer_cd){
              reject('error while generating customer code');
            }
            let insertQuery = 'INSERT INTO m_customer (customer_cd, customer_name, address, tel_number, email, staff_name, logo, upd_date, post_number, fax_number) VALUES ($1, $2, $3,$4, $5, $6,$7, $8, $9,$10) returning id';
            let dataArr = [customer_cd, data.customer_name, data.address, data.tel_number, data.email, data.staff_name, data.logo, 'now()' , data.post_number, data.fax_number];
            insertNewCustomer(insertQuery, dataArr, data)
            .then(function(data){
                if(data){
                  console.log(JSON.stringify(data));
                  return db.query('INSERT INTO sonus_outbound_rates (customer_id, landline, mobile, date_added, updated_by) VALUES ($1, $2, $3,$4, $5) returning id',
                  [customer_cd, data.landline_rate, data.mobile_rate, 'now()', data.updated_by],ipsPortal=true)
                }
                resolve('addded 1');
          })        
          resolve('addded 2');
        }) 
          resolve('addded3');
        })
        
        .catch(function(err) {
          reject(err);
        });
    });
  },

  delete: function(data) {

    //console.log("date="+JSON.stringify(data));

    return new Promise(function(resolve, reject) {
      db.query('update m_customer set is_deleted = true WHERE id = $1 returning id', [data.id],ipsPortal=true)
        .then(function(result) {
          resolve(result.rows[0]);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },

  listUsers: function() {

    //console.log("date="+JSON.stringify(data));

    return new Promise(function(resolve, reject) {
      db.query('select id, name, email_id from users order by email_id', [],ipsPortal=true)
        .then(function(result) {
          resolve(result.rows);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },

  
  updateCustomerInfo: function(data) {
    return new Promise(function(resolve, reject) {
      if (!data.id || !data.customer_code) {
        reject('error: id and/or customer code missing')
      }
      else {
        db.query('UPDATE users SET name = $2 WHERE id = $1 returning name', [data.id, data.name])
          .then(function(result) {
            resolve(result.rows[0]);
          })
          .catch(function(err) {
            reject(err);
          });
      }
    });
  },

 };

function findOneById(id) {
  return new Promise(function(resolve, reject) {
    db.query('SELECT * FROM m_customer WHERE id = $1 and is_deleted=false', [id], ipsPortal=true)
      .then(function(result) {
        if (result.rows[0]) {
          resolve(result.rows[0]);
        }
        else {
          reject('no customer found')
        }
      })
      .catch(function(err) {
        reject(err);
      });
  });
}

function findOneByCustomerCode(customer_code) {
  return new Promise(function(resolve, reject) {
    db.query('SELECT * FROM m_customer WHERE customer_cd = $1 and is_deleted=false', [customer_code],ipsPortal=true)
      .then(function(result) {
        if (result.rows[0]) {
          resolve(result.rows[0]);
        }
        else {
          reject('no customer found')
        }
      })
      .catch(function(err) {
        reject(err);
      });
  });
}


function validateUserData(data) {
 
  console.log("add customer");
  console.log(data);

  return new Promise(function(resolve, reject) {

    if ( !data.customer_name || !data.address || !data.service_type) {     
      if(data.service_type=='sonus_outbound'){
        if(!data.trunk_port || !data.mobile_rate || !data.landline_rate){
          reject('trunk port and/or mobile rate and/or landline rate missing');  
        }else{
          resolve();
        }
      }else{
        reject('customer code and/or customer name and/or service type  and/or address missing');
      } 
      
    }
    else {
      resolve();
    }    
  });
}

function insertNewCustomer(query, dataArr,data){
  return new Promise(function(resolve, reject) {
    return db.query(query,dataArr,ipsPortal=true)
      .then(function(result) {
        if (result.rows[0]) {
          resolve(data);        
        }
      })
      .catch(function(err) {
        reject(err);
      });
  });
}


function genrateCustomerCode() {
  return new Promise(function(resolve, reject) {
    db.query('SELECT customer_cd FROM m_customer order by id desc limit 1',[],ipsPortal=true)
      .then(function(result) {
        if (result.rows[0]) {
          let customer_cd = result.rows[0]['customer_cd'];
          customer_cd = parseInt(customer_cd,10);
          customer_cd = customer_cd+1;
          customer_cd = customer_cd.toString().padStart(8,'0');
          resolve(customer_cd);
        }else{
          reject('error in genrating customer code');
        }                        
      })
      .catch(function(err) {
        reject(err);
      });
  });
}