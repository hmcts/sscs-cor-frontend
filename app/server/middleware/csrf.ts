const csurf = require('csurf');

function csrfToken(req, res, next) {
  next();
}

function csrfTokenEmbed(req, res, next) {
  next();
}

export {
  csrfToken,
  csrfTokenEmbed
};
