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
});
