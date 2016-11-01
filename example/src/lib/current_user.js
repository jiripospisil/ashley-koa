'use strict';

const _ = require('lodash');

class CurrentUser {
  constructor() {
    this._user = null;
  }

  set(user) {
    this._user = user;
  }

  // Use Proxy?
  get username() {
    return _.get(this._user, 'username');
  }
}

module.exports = CurrentUser;
