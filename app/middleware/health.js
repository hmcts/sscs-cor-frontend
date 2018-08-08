const healthCheck = require('@hmcts/nodejs-healthcheck');

module.exports = (req, res) => {
  const redisStatus = req.session ? 'UP' : 'DOWN';
  const status = Object.assign({}, healthCheck.up(), { redisStatus });
  res.json(status);
};
