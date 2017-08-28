'use strict';

const bcrypt = require('bcryptjs');

module.exports = function compare(password, digest) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, digest, (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  });
};
