'use strict';

const auth = require('basic-auth');

module.exports = async function(ctx, next, currentUser, userRegistry, logger) {
  logger.info('Authenticating the coming user...');

  const credentials = auth(ctx);

  if (credentials) {
    const user = await userRegistry.findByUsernameAndPassword(credentials.name, credentials.pass);
    if (user) {
      currentUser.set(user);
      logger.info(`Recognized "${currentUser.username}"`);
      return await next();
    }
    logger.info('Invalid credentials given.');
  }

  ctx.status = 401;
  ctx.set('WWW-Authenticate', 'Basic');
  ctx.type = 'html';
};
