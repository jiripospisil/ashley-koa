'use strict';

module.exports = async function(ctx, next, logger) {
  logger.info(`Starting ${ctx.method} ${ctx.path} for ${ctx.ip}...`);
  const now = Date.now();
  await next();
  logger.info(`Completed ${ctx.status} in ${Date.now() - now}ms.`);
};
