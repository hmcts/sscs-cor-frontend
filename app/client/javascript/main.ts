import * as govUK from 'govuk-frontend';
import * as expandingTextBox from './expanding-textbox';
import { EvidenceUpload } from './evidence-upload';
import { CheckCookies } from './check-cookies';
import { SessionInactivity } from './session-inactivity';

const domready = require('domready');

const onReady = () => {
  let checkCookies = new CheckCookies();
  const evidence = new EvidenceUpload();
  let sessionInactivity = new SessionInactivity();
  checkCookies.init();
  govUK.initAll();
  expandingTextBox.init();
  sessionInactivity.init();
};

domready(onReady);

export {
  onReady
};
