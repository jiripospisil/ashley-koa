'use strict';

const _ = require('lodash');
const thunkify = require('thunkify');
const bcrypt = require('bcryptjs');

const compare = thunkify(bcrypt.compare);
const User = require('./user');

class MongoUserRegistry {
  constructor(connection) {
    this._connection = connection;
  }

  *findByUsernameAndPassword(username, password) {
    const user = yield this._connection.findOne('users', { username });

    if (user && (yield compare(password, user.password_digest))) {
      return new User(_.omit(user, ['password_digest']));
    }
  }
}

module.exports = MongoUserRegistry;
