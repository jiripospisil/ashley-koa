'use strict';

class RequestLogger {
  constructor(logger, requestId) {
    this._logger = logger.child({ component: 'Web' });
    this._requestId = requestId;
  }

  info(...args) {
    this._logger.info({ requestId: this._requestId }, ...args);
  }

  error(...args) {
    this._logger.error({ requestId: this._requestId }, ...args);
  }
}

module.exports = RequestLogger;
