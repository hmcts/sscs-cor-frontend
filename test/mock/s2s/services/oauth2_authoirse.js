module.exports = {
  path: '/oauth2/authorize',
  method: 'POST',
  render: (req, res) => {
    res.append('Content-Type', 'text/plain');
    res.send('{ code: "code1234"}');
  },
};
