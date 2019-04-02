const cache = require('memory-cache');

function cacheStatementState(statementText) {
  cache.put('additionalEvindece.statement', statementText);
}

module.exports = {
  path: '/continuous-online-hearings/:onlineHearingId/statement',
  method: 'PUT',
  cache: false,
  status: (req, res, next) => {
    cacheStatementState(req.body.statementText);
    next();
  }
};