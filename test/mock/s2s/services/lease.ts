module.exports = {
  path: '/lease',
  method: 'POST',
  render: (req, res) => {
    res.append('Content-Type', 'text/json');
    res.send(
      '22JhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzc2NzIiwiZXhwIjoxNTQxMDg2MjM5fQ.zJU2aEMiFPo_5ybnUet12FNPbJ1eIXkvw-U-' +
        'pON4Wek3IPvYYKaYdeg0Ygf8lrPP9Tn9gPJPBj3uNl6uidlmGw'
    );
  },
};
