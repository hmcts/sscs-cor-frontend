const { NOT_FOUND, UNPROCESSABLE_ENTITY } = require('http-status-codes');

module.exports = {
  path: '/continuous-online-hearings',
  method: 'GET',
  status: (req, res, next) => {
    if (req.query.email === 'not.found@example.com') {
      res.status(NOT_FOUND);
    }
    if (req.query.email === 'multiple@example.com') {
      res.status(UNPROCESSABLE_ENTITY);
    }
    next();
  },
  template: {
    appellant_name: 'Adam Jenkins',
    case_reference: 'SC/112/233',
    online_hearing_id: 'abc-123-def-456'
  }
};
