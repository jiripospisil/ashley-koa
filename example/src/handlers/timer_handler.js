'use strict';

module.exports = function *(next, logger) {
  logger.info(`Starting ${this.method} for ${this.ip}...`);
  const now = Date.now();
  yield next;
  logger.info(`Completed ${this.status} in ${Date.now() - now}ms.`);
};
