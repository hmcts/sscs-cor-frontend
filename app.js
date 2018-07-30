const { Express } = require('@hmcts/nodejs-logging');
const { nunjucksSetup } = require('app/core/nunjucksUtils');
const expressNunjucks = require('express-nunjucks');
const express = require('express');
const favicon = require('serve-favicon');
const routes = require('app/routes');
const path = require('path');

const app = express();

app.set('view engine', 'html');
app.set('views', [
  `${__dirname}/lib/`,
  `${__dirname}/app/views`,
  `${__dirname}/app/views/notifications`
]);

app.use(Express.accessLogger());

nunjucksSetup.env = expressNunjucks(app, {
  autoescape: true,
  watch: true,
  noCache: false,
  filters: {}
}).env;

app.use('/public', express.static(`${__dirname}/public`));
app.use('/public', express.static(`${__dirname}/govuk_modules/govuk_template/assets`));
app.use('/public', express.static(`${__dirname}/govuk_modules/govuk_frontend_toolkit`));
app.use('/public/images/icons', express.static(
  `${__dirname}/govuk_modules/govuk_frontend_toolkit/images`));

// Elements refers to icon folder instead of images folder
app.use(favicon(path.join(
  __dirname,
  'govuk_modules',
  'govuk_template',
  'assets',
  'images',
  'favicon.ico')
));

app.use('/', routes);

module.exports = app;
