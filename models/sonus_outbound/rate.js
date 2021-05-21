var db = require('./../../config/database');

module.exports = {
  findAll: async function() {
      try {
          const query="select sor.*,soc.customer_name from (select * from sonus_outbound_rates)as sor join (select customer_name, customer_id  from sonus_outbound_customer) as soc on (soc.customer_id=sor.customer_id)";
          const rateListRes= await db.query(query,[], ipsPortal=true);
          return rateListRes.rows;
      } catch (error) {
          return error;
      }
  },

  create: async function(data) {
    console.log(data);
    try {
      //  if(validateRateData()){
            const query=`INSERT INTO sonus_outbound_rates (customer_id, landline, mobile, date_added ) VALUES ($1, $2, $3) returning rate_id`;
            const value= [data.customer_id, data.landline, data.mobile, 'now()'];
            const res = await db.query(query,value, ipsPortal=true);            
            return res.rows[0];
      //  }
    } catch (error) {
        return error;
    }
  },
  updateRates: async function(data) {
    //console.log(data);
    let updateData = '';
    try {
      //  if(validateRateData()){
            if(!data.customer_id){
              return {'err':'customer id is required'};
            }

            if(data.landline){
              updateData = 'landline='+data.landline+',';
            }
            
            if(data.mobile){
              updateData = updateData + 'mobile='+data.mobile;
            }
            // remove ',' from last character
            if(updateData.substr(updateData.length - 1)==','){
              updateData = updateData.substring(0, updateData.length - 1);
            }

            const query=`INSERT INTO sonus_outbound_rates_history (customer_id, landline, mobile, date_added ) VALUES ($1, $2, $3, $4) returning customer_id`;
            const value= [data.customer_id, data.landline, data.mobile, 'now()'];
            const res = await db.query(query,value, ipsPortal=true);
            
            //console.log("res==");
            //console.log(res);
            
            const queryUpdate = `update sonus_outbound_rates set ${updateData} where customer_id = '${data.customer_id}'`;
            const resUpdate = await db.query(queryUpdate,[], ipsPortal=true); 
            
            return resUpdate.rows[0];
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