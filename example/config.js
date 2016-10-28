'use strict';

module.exports = {
  mongodb: {
    uri: 'mongodb://localhost:37017/ashley-koa-test',
    options: {}
  },

  logger: {
    name: 'Example App',
    level: 'info'
  },

  users: [
    {
      username: 'bob',
      // bob
      password_digest: '$2a$04$Sl2VUvDmP5th6mLCvwXrqOciOEMRP4Gyt/.sQAgZiyhCAw4uSOFrW'
    },

    {
      username: 'alice',
      // alice
      password_digest: '$2a$04$4jpg87R3ZYkapofbW9THZOjslkf9I9PhaLTwegTdzqPE5riBYK5nO'
    }
  ]
};
