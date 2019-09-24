const csurf = require('csurf');
import * as Paths from '../paths';

function csrfToken(req, res, next) {
  const csrfMiddleware = csurf({ cookie: false });
  if (CheckIfPathDefined(req.path)) {
    csrfMiddleware(req, res, next);
  } else {
    next();
  }
}

function csrfTokenEmbed(req, res, next) {
  if (CheckIfPathDefined(req.path)) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
}

function CheckIfPathDefined(current) {
  for (const path in Paths) {
    if (current.includes(Paths[path])) {
      return true;
    }
  }
  return false;
}

export {
  csrfToken,
  csrfTokenEmbed
};
