'use strict';

module.exports = function *(next, logger) {
  try {
    yield next;
  } catch (e) {
    logger.error(e);
    this.body = 'An internal error occured!';
  }
};
