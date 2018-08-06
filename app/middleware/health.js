const healthCheck = require('@hmcts/nodejs-healthcheck');

module.exports = (req, res) => {
  const redisStatus = req.session ? 'UP' : 'DOWN';
  res.json({ ...healthCheck.up(), redisStatus });
};
