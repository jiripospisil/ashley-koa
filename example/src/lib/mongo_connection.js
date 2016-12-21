'use strict';

const { MongoClient } = require('mongodb');

class MongoConnection {
  constructor(config, logger) {
    this._config = config;
    this._logger = logger.child({ component: 'MongoConnection' });
  }

  async initialize() {
    this._logger.info('Connecting to the database...');
    this._connection = await MongoClient.connect(
        this._config.mongodb.uri, this._config.mongodb.options);
    this._logger.info('Connected.');
    await this.seed();
  }

  async deinitialize() {
    this._logger.info('Closing the database connection');

    if (this._connection) {
      await this._connection.close();
    }

    this._logger.info('Closed.');
  }

  async findOne(collectionName, ...args) {
    const collection = this._connection.collection(collectionName);
    return await collection.findOne(...args);
  }

  async seed() {
    // Add some sample data
    this._logger.info('Seeding the database.');

    const users = this._connection.collection('users');
    await users.removeMany();
    await users.insertMany(this._config.users);

    this._logger.info('Seeded.');
  }
}

module.exports = MongoConnection;
