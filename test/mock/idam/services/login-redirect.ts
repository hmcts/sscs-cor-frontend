import cache from 'memory-cache';

export default {
  path: '/login',
  method: 'POST',
  render: (req, res) => {
    cache.put('email', req.body.username);
    const stateParam = req.body.state ? `&state=${req.body.state}` : '';
    res.redirect(`${req.body.redirect_uri}?code=123${stateParam}`);
  },
  cache: false,
};
