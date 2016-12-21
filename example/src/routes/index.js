'use strict';

module.exports = async function(ctx, next, currentUser) {
  // Use a templating engine!
  ctx.type = 'text/html';
  ctx.body = `Hello ${currentUser.username}!<br><a href="${ctx.protocol}://nope:nope@${ctx.host}">Logout</a>`;
};
