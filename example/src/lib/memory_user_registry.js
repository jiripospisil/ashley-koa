'use strict';

const _ = require('lodash');

const compare = require('./util/compare');
const User = require('./user');

class MemoryUserRegistry {
  constructor(config) {
    this._config = config;
  }

  async findByUsernameAndPassword(username, password) {
    const user = _.find(this._config.users, ['username', username]);

    if (user && (await compare(password, user.password_digest))) {
      return new User(_.omit(user, ['password_digest']));
    }
  }
}

module.exports = MemoryUserRegistry;
