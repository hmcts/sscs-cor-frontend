import * as AppInsights from '../app-insights';

import csurf from 'csurf';

function csrfToken(req, res, next) {
  const csrfMiddleware = csurf();
  const session = req.session;
  if (session?.accessToken) {
    csrfMiddleware(req, res, next);
  } else {
    if (!session) {
      AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
    }
    next();
  }
}

function csrfTokenEmbed(req, res, next) {
  const session = req.session;
  if (session?.accessToken) {
    res.locals.csrfToken = req.csrfToken();
  }
  if (!session) {
    AppInsights.trackEvent('MYA_SESSION_READ_FAIL');
  }
  next();
}

export { csrfToken, csrfTokenEmbed };
