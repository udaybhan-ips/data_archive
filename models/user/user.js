var Promise = require('promise');
var db = require('./../../config/database');
var bcrypt = require('bcrypt');
const { use } = require('../../routes/auth.routes');

module.exports = {
  findAll: function() {
    return new Promise(function(resolve, reject) {
      db.query('SELECT id, name, email_id FROM users', [],ipsPortal=true)
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
      if (!data.id && !data.email) {
        reject('error: must provide id or email')
      }
      else {
        if (data.id) {
          findOneById(data.id)
            .then(function(result) {
              delete result.password;
              resolve(result);
            })
            .catch(function(err) {
              reject(err);
            });
        }
        else if (data.email) {
          findOneByEmail(data.email)
            .then(function(result) {
              delete result.password;
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
    
    return new Promise(function(resolve, reject) {
      validateUserData(data)
        .then(function() {
          return hashPassword(data.password);
        })
        .then(function(hash) {
          return db.query(
            'INSERT INTO users (name, email_id, password, role) VALUES ($1, $2, $3, $4) returning id',
            [data.name, data.email, hash, data.role],ipsPortal=true);
        })
        .then(function(result) {
          resolve(result.rows[0]);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },

  delete: function(data) {
    return new Promise(function(resolve, reject) {
      db.query('DELETE FROM users WHERE id = $1 returning id', [data.id],ipsPortal=true)
        .then(function(result) {
          resolve(result.rows[0]);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },

  updateName: function(data) {
    return new Promise(function(resolve, reject) {
      if (!data.email || !data.name) {
        reject('error: email and/or name missing')
      }
      else {
        db.query('UPDATE users SET name = $2 WHERE email_id = $1 returning name', [data.email, data.name],ipsPortal=true)
          .then(function(result) {
            resolve(result.rows[0]);
          })
          .catch(function(err) {
            reject(err);
          });
      }
    });
  },

  updateUserRole: function(data) {
    return new Promise(function(resolve, reject) {
      if (!data.role || !data.email) {
        reject('error: role and/or email missing')
      }
      else {
        validateEmail(data.email)
          .then(function() {
            return db.query('UPDATE users SET role = $2 WHERE email_id = $1 returning email_id', [data.email, data.role],ipsPortal=true);
          })
          .then(function(result) {
            resolve(result.rows[0]);
          })
          .catch(function(err) {
            reject(err);
          });
      }
    });
  },

  updatePassword: function(data) {
    return new Promise(function(resolve, reject) {
      if (!data.email || !data.password) {
        reject('error: email and/or password missing')
      }
      else {
        validatePassword(data.password, 6)
          .then(function() {
            return hashPassword(data.password);
          })
          .then(function(hash) {
            return db.query('UPDATE users SET password = $2 WHERE email_id = $1 returning email_id', [data.email, hash],ipsPortal=true);
          })
          .then(function(result) {
            resolve(result.rows[0]);
          })
          .catch(function(err) {
            reject(err);
          });
      }
    });
  },
  updatePasswordByUser: function(data) {
    console.log("data="+JSON.stringify(data));
    return new Promise(function(resolve, reject) {
      if (!data.email || !data.password || !data.current_password) {
        reject('error: email and/or password and/or current password missing')
      }
      else {
        findOneByEmail(data.email)
          .then(function(user) {
             return verifyPassword(data.current_password, user);
          })
          .then(function(result) {
            validatePassword(data.password, 6)
            .then(function() {
              return hashPassword(data.password);
            })
            .then(function(hash) {
              return db.query('UPDATE users SET password = $2 WHERE email_id = $1 returning email_id', [data.email, hash],ipsPortal=true);
            })
            .then(function(result) {
              resolve(result.rows[0]);
            })
            .catch(function(err) {
              reject(err);
            });
          })
          .catch(function(err) {
            reject(err);
          });

      }
    });
  },

  authenticate: function(data) {
    return new Promise(function(resolve, reject) {
      if (!data.email || !data.password) {
        reject('error: email and/or password missing')
      }
      else {
        // change all of this to one transaction?
        findOneByEmail(data.email)
          .then(function(user) {
            // Reset login attempts if more than 15 minutes have passed
            if (Date.now() - user.last_login_attempt >= 900000) {
              user.login_attempts = -1;
            }
            return db.query(
              'UPDATE users SET last_login_attempt = now(), login_attempts = $2 WHERE email_id = $1 returning *',
              [data.email, user.login_attempts + 1],ipsPortal=true
            );
          })
          .then(function(result) {
           
            if (result.rows[0].login_attempts < 1000) {
              return result.rows[0];
            }
            else {
              reject('error: attempting to login too frequently, try again in 15 minutes');
            }
          })
          .then(function(user) {
             return verifyPassword(data.password, user);
          })
          .then(function(result) {
            
            resolve({ isAuthorized: result.isValid, email:result.email,name:result.name, id: result.id, role:result.role });
          })
          .catch(function(err) {
            reject(err);
          });
      }
    });
  }
};

function findOneById(id) {
  
  return new Promise(function(resolve, reject) {
    db.query('SELECT * FROM users WHERE id = $1', [id],ipsPortal=true)
      .then(function(result) {
        if (result.rows[0]) {
          resolve(result.rows[0]);
        }
        else {
          reject('no user found')
        }
      })
      .catch(function(err) {
        reject(err);
      });
  });
}

function findOneByEmail(email) {
  console.log("email="+email);
  return new Promise(function(resolve, reject) {
    db.query('SELECT * FROM users WHERE email_id = $1', [email],ipsPortal=true)
      .then(function(result) {
        if (result.rows[0]) {
          resolve(result.rows[0]);
        }
        else {
          reject('no user found')
        }
      })
      .catch(function(err) {
        reject(err);
      });
  });
}

function hashPassword(password) {
  return new Promise(function(resolve, reject) {
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        reject(err);
      }
      else {
        bcrypt.hash(password, salt, function(err, hash) {
          if (err) {
            reject(err);
          }
          else {
            resolve(hash);
          }
        });
      }
    });
  });
}

function validateUserData(data) {

  //console.log("data=="+JSON.stringify(data));

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
        resolve({ isValid: result,id:user.id,name:user.name, email: user.email_id, role:user.role });
      }
    });
  });
}