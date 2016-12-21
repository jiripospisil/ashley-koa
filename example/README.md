# Example app

```bash
npm install
npm start
```

The example contains a slightly extended version of the app described in the
main README. It implements what's essentially a password protected Hello world.

The app will use basic authentication to authenticate users against a selected
backend. There two available - MongoDB and Memory. It's possible to switch
between them in the `main.js` file. When set to MongoDB, make sure the correct
Mongo URI is set in the config file.

The available users are stored in the `config` file (`bob/bob`, `alice/alice`)
and are either seeded on startup (MongoDB) or used directly from memory.

Keep in mind that the app serves as usage demonstration. Using a container for
an application of this size is unnecessary. See [the
documentation](https://github.com/jiripospisil/ashley#should-i-use-ashley-for-projects-of-any-size)
for more info.

Note that as there's no standard way of signing out users when using Basic Auth,
the logout might be a bit wonky depending the used web browser and might ask for
the credentials every time after signing out. Navigating to the address directly
(instead of refreshing) seems to make it work properly again.
