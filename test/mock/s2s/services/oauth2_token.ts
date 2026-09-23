module.exports = {
  path: '/o/token',
  method: 'POST',
  template: {
    access_token: 'access_token1234',
    token_type: 'Bearer',
    expires_in: 28800,
    scope: 'openid profile roles',
  },
};
