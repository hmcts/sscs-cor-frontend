const $ = require('jquery');
const GOVUKFrontend = require('govuk-frontend');
const expandingTextbox = require('./expanding-textbox');

$(document).ready(() => {
  GOVUKFrontend.initAll();
  expandingTextbox.init();
});
