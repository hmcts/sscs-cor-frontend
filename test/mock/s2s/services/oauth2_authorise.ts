module.exports = {
  path: '/o/token?grant_type=password',
  method: 'POST',
  render: (req, res) => {
    res.append('Content-Type', 'text/plain');
    res.send('{ code: "code1234"}');
  },
};
