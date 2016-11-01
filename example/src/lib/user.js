'use strict';

const _ = require('lodash');

class User {
  constructor(properties) {
    _.assign(this, properties);
  }
}

module.exports = User;
