var config = require('./../../config/config');
var db = require('./../../config/database');

module.exports = {
  findAll: async function() {
      try {
          const query="SELECT * FROM cdr_sonus_rate";
          const rateListRes= await db.query(query,[]);
          return rateListRes.rows;
      } catch (error) {
          return error;
      }
  },

  create: async function(data) {
    console.log(data);
    try {
      //  if(validateRateData()){
            const query=`INSERT INTO cdr_sonus_rate (company_code, carrier_code, carrier_name, call_sort, 
                date_start, date_expired, rate_setup, rate_second, date_updated, currnet_flag  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning rate_id`;
            const value= [data.company_code, data.carrier_code, data.carrier_name, data.call_sort, 
                data.date_start, data.date_expired, data.rate_setup, data.rate_second, 'now()', data.current_flag];
            const res = await db.query(query,value);
            return res.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },

  
}

function validateUserData(data) {
  return new Promise(function(resolve, reject) {
    if (!data.password || !data.email) {
      reject('email and/or password missing')
    }
    else {
      validatePassword(data.password, 6)
        .then(function() {
          return validateEmail(data.email);
        })
        .then(function() {
          resolve();
        })
        .catch(function(err) {
          reject(err);
        });
    }
  });
}

function validateEmail(email) {
  return new Promise(function(resolve, reject) {
    if (typeof (email) !== 'string') {
      reject('email must be a string');
    }
    else {
      var re = new RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
      if (re.test(email)) {
        resolve();
      }
      else {
        reject('provided email does not match proper email format');
      }
    }
  });
}

function validatePassword(password, minCharacters) {
  return new Promise(function(resolve, reject) {
    if (typeof (password) !== 'string') {
      reject('password must be a string');
    }
    else if (password.length < minCharacters) {
      reject('password must be at least ' + minCharacters + ' characters long');
    }
    else {
      resolve();
    }
  });
}

function verifyPassword(password, user) {
  return new Promise(function(resolve, reject) {
    bcrypt.compare(password, user.password, function(err, result) {
      if (err) {
        reject(err);
      }
      else {
        resolve({ isValid: result, id: user.id });
      }
    });
  });
}