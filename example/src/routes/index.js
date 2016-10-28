'use strict';

module.exports = function *(next, currentUser) {
  // Use a templating engine!
  this.type = 'text/html';
  this.body = `Hello ${currentUser.username}!<br><a href="${this.protocol}://nope:nope@${this.host}">Logout</a>`;
};
