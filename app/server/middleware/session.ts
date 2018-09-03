const session = require('express-session');
const config = require('config');

const isSecure = config.get('session.cookie.secure') === 'true';

// TODO - chech with Dave
function createSession(store?: any) {
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

export {
  createSession
}
