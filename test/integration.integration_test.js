'use strict';

const { expect } = require('chai');
const Koa = require('koa');
const Ashley = require('ashley');
const uuid = require('uuid');
const request = require('supertest');

const integration = require('..');

describe('Integration', function() {
  it('correctly manages life times', async function() {
    let called = 0;

    const app = new Koa();
    const ashley = new Ashley();

    ashley.object('GlobalId', uuid.v4());

    integration.initialize(app, ashley, child => {
      child.object('PerRequestId', uuid.v4());

      child.function('Index', async function(ctx, globalId, perRequestId) {
        called++;
        ctx.body = { globalId, perRequestId };
      }, [Ashley._, 'GlobalId', 'PerRequestId']);
    });

    app.use(integration.middleware('Index'));

    const listening = app.listen();
    const first = await request(listening).get('/');
    const second = await request(listening).get('/');

    expect(called).to.equal(2);
    expect(first.body.globalId).to.equal(second.body.globalId);
    expect(first.body.perRequestId).to.not.equal(second.body.perRequestId);
  });

  it('deinitializes instances even if an error occured', async function() {
    let called = 0;

    const app = new Koa();
    const ashley = new Ashley();

    integration.initialize(app, ashley, child => {
      child.instance('Service', class {
        async deinitialize() {
          called++;
        }
      }, [], { deinitialize: true });

      child.function('Index', async function() {
        called++;
        throw new Error('Error1');
      }, ['Service']);
    });

    app.use(integration.middleware('Index'));

    app.on('error', error => {
      called++;
      expect(error.message).to.equal('Error1');
    });

    const listening = app.listen();
    const response = await request(listening).get('/');

    expect(response.status).to.equal(500);
    expect(called).to.equal(3);
  });
});
