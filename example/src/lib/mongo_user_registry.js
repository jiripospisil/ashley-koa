'use strict';

const _ = require('lodash');

const compare = require('./util/compare');
const User = require('./user');

class MongoUserRegistry {
  constructor(connection) {
    this._connection = connection;
  }

  async findByUsernameAndPassword(username, password) {
    const user = await this._connection.findOne('users', { username });

    if (user && (await compare(password, user.password_digest))) {
      return new User(_.omit(user, ['password_digest']));
    }
  }
}

module.exports = MongoUserRegistry;
