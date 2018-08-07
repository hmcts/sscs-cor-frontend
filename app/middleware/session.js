const session = require('express-session');
const config = require('config');

const isDevelopment = process.env.NODE_ENV === 'development';

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
