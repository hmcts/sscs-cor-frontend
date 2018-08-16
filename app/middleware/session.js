const session = require('express-session');
const config = require('config');

const isSecure = config.get('session.cookie.secure') === 'true';

module.exports = function createSession(store) {
  return session({
    cookie: {
      httpOnly: true,
      maxAge: config.get('session.cookie.maxAgeInMs'),
      secure: isSecure
    },
    resave: true,
    saveUninitialized: true,
    secret: config.get('session.redis.secret'),
    store
  });
};
