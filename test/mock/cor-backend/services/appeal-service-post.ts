const cache = require('memory-cache');

function cacheStopReceivingEmails(token) {
  cache.put(`${token}.appealId`, '12345');
  cache.put(`${token}.subscriptionId`, 'abcdefgh');
}

export = {
  path: '/appeals/:appealId/subscriptions/:subscriptionId',
  method: 'DELETE',
  status: (req, res, next) => {
    cacheStopReceivingEmails(res.locals.token);
    next();
  },
};
