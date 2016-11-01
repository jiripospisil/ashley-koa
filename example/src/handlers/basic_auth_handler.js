'use strict';

const auth = require('basic-auth');

module.exports = function *(next, currentUser, userRegistry, logger) {
  logger.info('Authenticating the coming user...');

  const credentials = auth(this);

  if (credentials) {
    const user = yield userRegistry.findByUsernameAndPassword(credentials.name, credentials.pass);
    if (user) {
      currentUser.set(user);
      logger.info(`Recognized "${currentUser.username}"`);
      return yield next;
    }
    logger.info('Invalid credentials given.');
  }

  this.status = 401;
  this.set('WWW-Authenticate', 'Basic');
  this.type = 'html';
};
