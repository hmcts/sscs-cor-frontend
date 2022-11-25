const cache = require('memory-cache');

export default {
  path: '/details',
  method: 'GET',
  template: {
    email: () => cache.get('email'),
  },
  cache: false,
};
