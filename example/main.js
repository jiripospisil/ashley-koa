'use strict';

const Ashley = require('ashley');
const koa = require('koa')();
const uuid = require('node-uuid');
const co = require('co');

const container = new Ashley({
  root: __dirname
});

const integration = require('ashley-koa');

// Configure instances that should be alive across requests
container.object('Config', require('./config'));
container.instance('Logger', 'src/lib/loggers/bunyan_logger', ['Config']);

// Backend: Choose one or the other
container.instance('UserRegistry', 'src/lib/memory_user_registry', ['Config']);
// container.instance('MongoConnection', 'src/lib/mongo_connection', ['Config', 'Logger'], {
//   initialize: true,
//   deinitialize: true
// });
// container.instance('UserRegistry', 'src/lib/mongo_user_registry', ['MongoConnection']);

// Configure instances that whould be unique for each request
integration.initialize(koa, container, requestContainer => {
  requestContainer.object('RequestId', uuid.v4());
  requestContainer.instance('RequestLogger', 'src/lib/loggers/request_logger', ['Logger', 'RequestId']);

  requestContainer.instance('CurrentUser', 'src/lib/current_user');

  requestContainer.function('TimerHandler', 'src/handlers/timer_handler', [Ashley._, 'RequestLogger']);
  requestContainer.function('ErrorHandler', 'src/handlers/error_handler', [Ashley._, 'RequestLogger']);

  requestContainer.function('BasicAuthHandler', 'src/handlers/basic_auth_handler',
      [Ashley._, 'CurrentUser', 'UserRegistry', 'RequestLogger']);
  requestContainer.function('IndexRoute', 'src/routes/index', [Ashley._, 'CurrentUser']);
});

koa.use(integration.middleware('TimerHandler'));
koa.use(integration.middleware('ErrorHandler'));
koa.use(integration.middleware('BasicAuthHandler'));

koa.use(integration.middleware('IndexRoute'));

process.on('SIGINT', function() {
  co(container.shutdown.bind(container))
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
});

console.log('Listening on http://localhost:3000');
koa.listen(3000);
