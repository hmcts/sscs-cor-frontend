const session = require('express-session');
const redis = require('connect-redis');
const config = require('config');

const isProduction = process.env.NODE_ENV !== 'development';

const RedisStore = redis(session);
const redisOpts = {
  url: config.get('session.redis.url'),
  ttl: config.get('session.redis.ttlInSeconds')
};
const redisStore = new RedisStore(redisOpts);

module.exports = session({
  cookie: {
    httpOnly: true,
    maxAge: config.get('session.cookie.maxAgeInMs'),
    secure: isProduction
  },
  resave: true,
  saveUninitialized: true,
  secret: config.get('session.cookie.secret'),
  store: redisStore
});
