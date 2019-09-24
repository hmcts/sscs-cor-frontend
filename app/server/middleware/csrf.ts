const csurf = require('csurf');
const csrfBlackList = ['/', '/sign-in', '/sign-out', '/register'];

function csrfToken(req, res, next) {
  const csrfMiddleware = csurf();
  if (req.session.accessToken && !csrfBlackList.includes(req.path)) {
    csrfMiddleware(req, res, next);
  } else {
    next();
  }
}

function csrfTokenEmbed(req, res, next) {
  if (req.session.accessToken && !csrfBlackList.includes(req.path)) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();

}

export {
  csrfToken,
  csrfTokenEmbed
};
