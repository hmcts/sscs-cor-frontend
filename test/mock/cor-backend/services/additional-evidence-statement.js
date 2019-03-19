const cache = require('memory-cache');

function cacheStatementState(statementText) {
  cache.put('additionalEvindece.statement', statementText);
}

module.exports = {
  path: '/additional-evidence/statmenet',
  method: 'PUT',
  cache: false,
  status: (req, res, next) => {
    cacheStatementState(req.body.statementText);
    next();
  }
};