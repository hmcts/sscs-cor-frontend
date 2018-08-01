const { Express } = require('@hmcts/nodejs-logging');
const nunjucks = require('nunjucks');
const express = require('express');
const routes = require('app/routes');

function setup() {
  const app = express();

  nunjucks.configure([
    'app/views',
    'node_modules/govuk-frontend/',
    'node_modules/govuk-frontend/components/'
  ], {
    autoescape: true,
    express: app
  });

  app.use(Express.accessLogger());

  app.use('/public', express.static(`${__dirname}/public`));
  app.use('/', routes);
  return app;
}

module.exports = { setup };
