'use strict';

const _ = require('lodash');
const bunyan = require('bunyan');

class BunyanLogger {
  constructor(config) {
    this._config = _.defaults(config.logger, {
      name: 'Example App',
      level: 'info'
    });

    this._bunyan = bunyan.createLogger(this._config);
  }

  child(...args) {
    return this._bunyan.child(...args);
  }

  info(...args) {
    this._bunyan.info(...args);
  }

  error(...args) {
    this._bunyan.error(...args);
  }

  // other levels ...
}

module.exports = BunyanLogger;
