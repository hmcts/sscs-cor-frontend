const { NO_CONTENT } = require('http-status-codes');

export = {
  path: '/session/:token',
  method: 'DELETE',
  status: (req, res, next) => {
    res.status(NO_CONTENT);
    next();
  },
};
