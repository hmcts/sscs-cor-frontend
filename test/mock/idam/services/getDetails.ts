import cache from 'memory-cache';

export default {
  path: '/o/userinfo',
  method: 'GET',
  template: {
    sub: () => cache.get('sub'),
  },
  cache: false,
};
