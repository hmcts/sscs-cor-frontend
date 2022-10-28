const cache = require('memory-cache');

module.exports = {
  path: '/details',
  method: 'GET',
  template: {
    email: () => cache.get('email'),
  },
  cache: false,
};
