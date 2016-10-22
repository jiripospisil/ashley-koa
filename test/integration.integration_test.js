'use strict';

const { expect } = require('chai');
const koa = require('koa');
const Ashley = require('ashley');
const uuid = require('node-uuid');
const request = require('supertest');

const integration = require('..');

describe('Integration', function() {
  it('correctly manages life times', function *() {
    let called = 0;

    const app = koa();
    const ashley = new Ashley();

    ashley.object('GlobalId', uuid.v4());

    integration.initialize(app, ashley, child => {
      child.object('PerRequestId', uuid.v4());

      child.function('Index', function *(next, globalId, perRequestId) {
        called++;
        this.body = { globalId, perRequestId };
      }, [Ashley._, 'GlobalId', 'PerRequestId']);
    });

    app.use(integration.middleware('Index'));

    const listening = app.listen();
    const first = yield request(listening).get('/');
    const second = yield request(listening).get('/');

    expect(called).to.equal(2);
    expect(first.body.globalId).to.equal(second.body.globalId);
    expect(first.body.perRequestId).to.not.equal(second.body.perRequestId);
  });

  it('deinitializes instances even if an error occured', function *() {
    let called = 0;

    const app = koa();
    const ashley = new Ashley();

    integration.initialize(app, ashley, child => {
      child.instance('Service', class {
        *deinitialize() {
          called++;
        }
      }, [], { deinitialize: true });

      child.function('Index', function *() {
        called++;
        throw new Error('Error1');
      }, [Ashley._, 'Service']);
    });

    app.use(integration.middleware('Index'));

    app.on('error', error => {
      called++;
      expect(error.message).to.equal('Error1');
    });

    const listening = app.listen();
    const response = yield request(listening).get('/');

    expect(response.status).to.equal(500);
    expect(called).to.equal(3);
  });
});
