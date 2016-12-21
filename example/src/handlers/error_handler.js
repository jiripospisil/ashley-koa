'use strict';

module.exports = async function(ctx, next, logger) {
  try {
    await next();
  } catch (e) {
    logger.error(e);
    ctx.body = 'An internal error occured!';
  }
};
