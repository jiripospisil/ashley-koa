'use strict';

function validate(parent, fn) {
  // Validate the parent container
  parent.validate();

  // Validate that all of the binds introduced by "fn" are valid as well
  const child = parent.createChild();
  fn(child);
  child.validate();
}

module.exports.initialize = function(koa, parent, fn) {
  validate(parent, fn);

  koa.use(async function(ctx, next) {
    ctx.__ashley = parent.createChild();

    fn(ctx.__ashley);

    try {
      await next();
    } finally {
      await ctx.__ashley.shutdown();
    }
  });
};

module.exports.middleware = function(name) {
  return async function(...args) {
    const ctx = args[0];
    const fn = await ctx.__ashley.resolve(name);
    await fn(...args);
  };
};
