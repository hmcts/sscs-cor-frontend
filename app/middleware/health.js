const healthCheck = require('@hmcts/nodejs-healthcheck');

module.exports = (req, res) => {
  res.json(healthCheck.up());
};
