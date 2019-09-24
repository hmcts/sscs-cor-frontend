const csurf = require('csurf');
const csrfBlackList = ['/', '/sign-in', '/sign-out', '/register', '/idam-stub/login', '/login', '/idam-stub/oauth2/token'];

function csrfToken(req, res, next) {
  const csrfMiddleware = csurf({ cookie: true });
  if (!csrfBlackList.includes(req.path)) {
    csrfMiddleware(req, res, next);
  } else {
    next();
  }
}

function csrfTokenEmbed(req, res, next) {
  if (!csrfBlackList.includes(req.path)) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
}

export {
  csrfToken,
  csrfTokenEmbed
};
