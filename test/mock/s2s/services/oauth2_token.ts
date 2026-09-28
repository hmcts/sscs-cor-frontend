module.exports = {
  path: '/oauth2/token',
  method: 'POST',
  render: (req, res) => {
    res.append('Content-Type', 'text/plain');
    res.send('{ access_token: "access_token1234"}');
  },
};
