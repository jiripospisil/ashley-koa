'use strict';

const Ashley = require('ashley');
const Koa = require('koa');
const router = require('koa-router')();
const uuid = require('uuid');

const integration = require('..');

const container = new Ashley({
  root: __dirname
});

const app = new Koa();

// Configure instances that should be alive across requests
container.object('Config', require('./config'));
container.instance('Logger', 'src/lib/loggers/bunyan_logger', ['Config']);

// Backend: Choose one or the other
// 1.
container.instance('UserRegistry', 'src/lib/memory_user_registry', ['Config']);

// 2.
// container.instance('MongoConnection', 'src/lib/mongo_connection', ['Config', 'Logger'], {
//   initialize: true,
//   deinitialize: true
// });
// container.instance('UserRegistry', 'src/lib/mongo_user_registry', ['MongoConnection']);

// Configure instances that should be unique for each request
integration.initialize(app, container, requestContainer => {
  requestContainer.object('RequestId', uuid.v4());
  requestContainer.instance('RequestLogger', 'src/lib/loggers/request_logger', ['Logger', 'RequestId']);

  requestContainer.instance('CurrentUser', 'src/lib/current_user');

  requestContainer.function('TimerHandler', 'src/handlers/timer_handler', [Ashley._, Ashley._, 'RequestLogger']);
  requestContainer.function('ErrorHandler', 'src/handlers/error_handler', [Ashley._, Ashley._, 'RequestLogger']);

  requestContainer.function('BasicAuthHandler', 'src/handlers/basic_auth_handler',
      [Ashley._, Ashley._, 'CurrentUser', 'UserRegistry', 'RequestLogger']);
  requestContainer.function('IndexRoute', 'src/routes/index', [Ashley._, Ashley._, 'CurrentUser']);
});

router.get('/', integration.middleware('IndexRoute'));

app
  .use(integration.middleware('TimerHandler'))
  .use(integration.middleware('ErrorHandler'))
  .use(integration.middleware('BasicAuthHandler'))
  .use(router.routes())
  .use(router.allowedMethods());

process.on('SIGINT', function() {
  container.shutdown()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
});

console.log('Listening on http://localhost:3000');
app.listen(3000);
