import cache from 'memory-cache';

export default {
  path: '/o/userinfo',
  method: 'GET',
  template: {
    email: () => cache.get('email'),
  },
  cache: false,
};
