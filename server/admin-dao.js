'use strict';
const db = require('./db');
const bcrypt = require('bcrypt');


// DAO operations for validating admins

exports.getAdmin = (username, password) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM administrators WHERE username = ?';
        db.get(sql, [username], (err, row) => {
            if (err)
                reject(err); // DB error
            else if (row === undefined)
                resolve(false); // admin not found
            else {
                bcrypt.compare(password, row.password).then(result => {
                    if (result) // password matches
                        resolve({id: row.id, username: row.username});
                    else
                        resolve(false); // password not matching
                })
            }
        });
    });
};

exports.getAdminById = (id) => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM administrators WHERE id = ?';
        db.get(sql, [id], (err, row) => {
          if (err) 
            reject(err);
          else if (row === undefined)
            resolve({error: 'Admin not found.'});
          else {
            // by default, the local strategy looks for "username": not to create confusion in server.js, we can create an object with that property
            const administrator = {id: row.id, username: row.username}
            resolve(administrator);
          }
      });
    });
  };
  