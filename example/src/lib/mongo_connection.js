'use strict';

const { MongoClient } = require('mongodb');

class MongoConnection {
  constructor(config, logger) {
    this._config = config;
    this._logger = logger.child({ component: 'MongoConnection' });
  }

  *initialize() {
    this._logger.info('Connecting to the database...');
    this._connection = yield MongoClient.connect(
        this._config.mongodb.uri, this._config.mongodb.options);
    this._logger.info('Connected.');
    yield this.seed();
  }

  *deinitialize() {
    this._logger.info('Closing the database connection');

    if (this._connection) {
      yield this._connection.close();
    }

    this._logger.info('Closed.');
  }

  *findOne(collectionName, ...args) {
    const collection = this._connection.collection(collectionName);
    return yield collection.findOne(...args);
  }

  *seed() {
    // Add some sample data
    this._logger.info('Seeding the database.');

    const users = this._connection.collection('users');
    yield users.removeMany();
    yield users.insertMany(this._config.users);

    this._logger.info('Seeded.');
  }
}

module.exports = MongoConnection;
