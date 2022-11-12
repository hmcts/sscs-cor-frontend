const cache = require('memory-cache');

function cacheChangeEmailAddress(token) {
  cache.put(`${token}.appealId`, '12345');
  cache.put(`${token}.subscriptionId`, 'abcdefgh');
}

export = {
  path: '/appeals/:appealId/subscriptions/:subscriptionId',
  method: 'POST',
  status: (req, res, next) => {
    cacheChangeEmailAddress(res.locals.token);
    next();
  },
};
