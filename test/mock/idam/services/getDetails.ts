const cache = require('memory-cache');

export = {
  path: '/details',
  method: 'GET',
  template: {
    email: () => cache.get('email'),
  },
  cache: false,
};
