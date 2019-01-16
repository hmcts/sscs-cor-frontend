import * as govUK from 'govuk-frontend';
import * as expandingTextBox from './expanding-textbox';
import { EvidenceUpload } from './evidence-upload';
import { CheckCookies } from './check-cookies';
import { SessionInactivity } from './session-inactivity';

const domready = require('domready');

const onReady = () => {
  let checkCookies = new CheckCookies();
  checkCookies.initCookies(window);
  govUK.initAll();
  expandingTextBox.init();
  const evidence = new EvidenceUpload();
  let sessionInactivity = new SessionInactivity(window);
  sessionInactivity.init();
};

domready(onReady);

export {
  onReady
};
