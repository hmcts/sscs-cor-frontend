import * as govUK from 'govuk-frontend';
import * as expandingTextBox from './expanding-textbox';
import { EvidenceUpload } from './evidence-upload';
import { CheckCookies } from './check-cookies';
const domready = require('domready');

const onReady = () => {
  let checkCookies = new CheckCookies();
  checkCookies.initCookies(window);
  govUK.initAll();
  expandingTextBox.init();
  const evidence = new EvidenceUpload();
};

domready(onReady);

export {
  onReady
};
