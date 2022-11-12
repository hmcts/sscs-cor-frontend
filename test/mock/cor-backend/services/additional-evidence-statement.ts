const cache = require('memory-cache');

function cacheStatementState(statementText) {
  cache.put('additionalEvindece.statement', statementText);
}

export = {
  path: '/api/continuous-online-hearings/:onlineHearingId/statement',
  method: 'POST',
  cache: false,
  status: (req, res, next) => {
    cacheStatementState(req.body.statementText);
    next();
  },
};
