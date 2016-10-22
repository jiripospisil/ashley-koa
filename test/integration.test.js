'use strict';

const { expect } = require('chai');

const integration = require('..');

describe('Integration', function() {
  describe('.initialize', function() {
    it('validates the containers and passes the child to the provided fn', function() {
      let called = 0;

      const child = {
        validate: () => called++
      };

      const parent = {
        validate: () => called++,
        createChild: () => {
          called++;
          return child;
        }
      };

      const koa = {
        use: () => called++
      };

      integration.initialize(koa, parent, childContainer => {
        called++;
        expect(childContainer).to.equal(child);
      });

      expect(called).to.equal(5);
    });
  });

  describe('.middleware', function() {
    it('resolves the function and calls it with the correct context', function *() {
      let called = 0;

      const fn = integration.middleware('testing');
      const ctx = {
        __ashley: {
          resolve: function *(name) {
            called++;
            expect(name).to.equal('testing');

            return function *(...args) {
              called++;
              expect(this).to.equal(ctx);
              expect(args).to.deep.equal([1, 2, 3]);
            };
          }
        }
      };

      yield fn.call(ctx, 1, 2, 3);
      expect(called).to.equal(2);
    });
  });
});
