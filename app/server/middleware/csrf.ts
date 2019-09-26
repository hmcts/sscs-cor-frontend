const csurf = require('csurf');

function csrfToken(req, res, next) {
  const csrfMiddleware = csurf();
  if (req.session.accessToken) {
    csrfMiddleware(req, res, next);
  } else {
    next();
  }
}

function csrfTokenEmbed(req, res, next) {
  if (req.session.accessToken) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();

}

export {
  csrfToken,
  csrfTokenEmbed
};
