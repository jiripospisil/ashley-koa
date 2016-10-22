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

  koa.use(function *(next) {
    this.__ashley = parent.createChild();

    fn(this.__ashley);

    try {
      yield next;
      yield this.__ashley.shutdown();
    } catch (e) {
      yield this.__ashley.shutdown();
      throw e;
    }
  });
};

module.exports.middleware = function(name) {
  return function *(...args) {
    const fn = yield this.__ashley.resolve(name);
    yield fn.call(this, ...args);
  };
};
