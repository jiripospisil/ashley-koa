# Ashley integration with the Koa framework

[Ashley](https://github.com/jiripospisil/ashley) can work in any Koa application
as is without any support, after all it's just plain JavaScript. However, in the
context of a web framework, it's often useful be able to bound a life time of an
object to the current request. This integration adds a few helper methods to do
that with minimal effort.

- [Installation](#installation)
- [Usage](#usage)
- [How it works](#how-it-works)
- [Recommendations](#recommendations)
- [License](#license)

# Installation

```bash
npm install ashley-koa
```

# Usage

First, it's necessary to initialize Ashley itself. This part is not yet Koa
specific and it's possible to use any constructs mentioned in the
[documentation](https://github.com/jiripospisil/ashley).

In the following example, `container` will act as the parent container and will be
available across all incoming requests. It's the place to bind objects whose
life time is bound to the application, not to a particular web request.

```javascript
const Ashley = require('ashley');
const container = new Ashley({
  root: __dirname
});

const integration = require('ashley-koa');

container.object('Config', 'src/config');
container.instance('DatabaseConnection', 'src/db_connection', ['Config'], {
  initialize: true,
  deinitialize: true
});
```

Note that Ashley will make sure that the `initialize` method on the instance
will be called just once even if there are multiple requests asking for the not
yet initialized instance at the very beginning.

Next, it's necessary to use the integration and bind objects whose life time
should be bound to the incoming request they are associated with.

```javascript
const koa = require('koa')();

integration.initialize(koa, container, requestContainer => {
  requestContainer.instance('UserRegistry', 'src/user_registry', ['DatabaseConnection']);
  requestContainer.instance('CurrentUser', 'src/current_user');

  requestContainer.function('BasicAuth', 'src/basic_auth', [Ashley._, 'CurrentUser', 'UserRegistry']);
  requestContainer.function('IndexRoute', 'src/routes/index', [Ashley._, 'CurrentUser']);
});
```

The first argument of the `initialize` function is an instance of Koa. The next
argument is the parent container and finally, the third argument is a function.
This function will be invoked with a single parameter, the request bound
container.

As the name suggests, the `requestContainer` container should contain only binds
whose life time is bound to the associated request. All instances will be
automatically de-initialized at the end of the request (there's no need to call
`shutdown` manually).

All middlewares are binded as
[functions](https://github.com/jiripospisil/ashley#binding-functions) with an
Ashley placeholder as the first argument and the required dependencies as the
rest. When a such function is resolved, it returns a generator function which
can be then called with arguments. These arguments will be passed in instead of
Ashley placeholders to the binded function along with the resolved dependencies.
The `IndexRoute` middleware can thus look as follows.

```javascript
// src/routes/index

module.exports = function *(next, currentUser) {
  this.body = `Hello ${currentUser.name}!`;
};
```

Finally, it's time to actually `use` the binded functions. Notice the functions
are passed to Koa outside of the user-defined function passed to `initialize`.
That's important because the function will be called for every request.

```javascript
// Use the binded function as middleware
koa.use(integration.middleware('BasicAuth'));
koa.use(integration.middleware('IndexRoute'));

koa.listen(3000);
```

# How it works

Internally, the `initialize` function adds a middleware to the passed Koa
instance. The middleware will create a new child container from the parent
container for every request and pass it into the user defined function. The
function then set ups the request bound binds. Since the function will be ran
for every request, it should NOT add any new middlewares (call `koa.use`),
otherwise they would be added more than once.

# Recommendations

## Treat the Koa framework as an implementation detail

It's often the case with Koa applications that the current state of the
application (e.g. the current user) is stored in the current context
(`this.user`). Further, it's very common to see Koa middlewares to actually
contain the business logic of the application. While it certainly works, an
alternative is to treat the fact that the data comes from a web request as an
implementation detail.

In this model, middlewares act as mediators. They have access to the data coming
in from web requests and they depend on Ashley to inject the necessary objects
which contain the actual business logic. The only logic in these mediators is
concerned with taking the data out of the web request (e.g. `this.params`) and
passing it into an object which knows what to do with it.

```javascript
// routes/articles/create
const boom = require('koa-boom');

module.exports = function *create(next, currentUser, articleRegistry) {
  try {
    articleRegistry.add(currentUser, this.params);
    this.status = 201;
  } catch (e) {
    // Handle the error or let it bubble up the chain.
    boom.badRequest(this, e.message);
  }
};
```

The advantage of this approach is that since the web interface is just a detail,
you can, for example, add more of them. Is HTTP too slow? Let's implement a
[Protocol Buffers](https://developers.google.com/protocol-buffers) or [Cap’n
Proto](https://capnproto.org) interface. Is REST not the right fit? Let's add a
[GraphQL](http://graphql.org/) interface. The same business logic, just
assembled differently.

Testing is also much easier. Since the logic is not tied to a web framework /
web request, it's possible to test the individual objects in total isolation
without having to spin up [SuperTest](https://github.com/visionmedia/supertest)
every time.

# License

ISC
