const csurf = require('csurf');

function csrfToken(req, res, next) {
  const csrfMiddleware = csurf({ cookie: false });
  if (req.session.idamEmail) {
    csrfMiddleware(req, res, next);
  } else {
    next();
  }
}

function csrfTokenEmbed(req, res, next) {
  if (req.session.idamEmail) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
}

export {
  csrfToken,
  csrfTokenEmbed
};
