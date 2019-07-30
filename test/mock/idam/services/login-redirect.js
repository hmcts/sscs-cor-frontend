const cache = require('memory-cache');

module.exports = {
  path: '/login',
  method: 'POST',
  render: (req, res) => {
    cache.put('email', req.body.username);
    res.redirect(`${req.body.redirect_uri}?code=123&state=${req.body.state}`);
  },
  cache: false
};