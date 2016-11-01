'use strict';

const _ = require('lodash');
const thunkify = require('thunkify');
const bcrypt = require('bcryptjs');

const compare = thunkify(bcrypt.compare);
const User = require('./user');

class MemoryUserRegistry {
  constructor(config) {
    this._config = config;
  }

  *findByUsernameAndPassword(username, password) {
    const user = _.find(this._config.users, ['username', username]);

    if (user && (yield compare(password, user.password_digest))) {
      return new User(_.omit(user, ['password_digest']));
    }
  }
}

module.exports = MemoryUserRegistry;
