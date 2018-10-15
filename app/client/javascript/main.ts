import * as govUK from 'govuk-frontend';
import * as expandingTextBox from './expanding-textbox';
const domready = require('domready');

domready(function () {
  govUK.initAll();
  expandingTextBox.init();
});

export default {};
