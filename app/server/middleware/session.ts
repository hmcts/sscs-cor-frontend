import * as session from 'express-session';
const config = require('config');

const isSecure = config.get('session.cookie.secure') === 'true';

function createSession(store?: session.Store) {
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
}

export {
  createSession
};
