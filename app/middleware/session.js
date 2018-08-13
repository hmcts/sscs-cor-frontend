const session = require('express-session');
const config = require('config');

const testUrl = config.get('testUrl');
const isDevelopment = process.env.NODE_ENV === 'development' || testUrl.indexOf('localhost') !== -1;

module.exports = function createSession(store) {
  return session({
    cookie: {
      httpOnly: true,
      maxAge: config.get('session.cookie.maxAgeInMs'),
      secure: !isDevelopment
    },
    resave: true,
    saveUninitialized: true,
    secret: config.get('session.cookie.secret'),
    store
  });
};
